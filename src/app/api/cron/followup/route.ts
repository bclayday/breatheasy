export const dynamic = "force-dynamic";

/**
 * Breathe Easy follow-up sequence (cron, daily ~10am ET).
 * Twilio history IS the system of record: no durable store needed.
 *
 * Who enters the sequence: anyone who called (missed or not) or texted
 * the BreathEasy line and has no inbound reply after our last touch.
 * Touches: +1h, +1d, +3d, +7d, +14d. Stops on: any inbound reply (pauses
 * 3 days), STOP/unsubscribe (forever), 5 touches (forever), booking signal.
 * Opt-out compliance: first touch includes STOP instructions; all keywords honored.
 * DRY_RUN=1 query param logs decisions without sending.
 */

const HOURS = 3600_000;
const TOUCH_HOURS = [1, 24, 72, 168, 336]; // +1h, +1d, +3d, +7d, +14d
const PAUSE_AFTER_REPLY_HOURS = 72;
const BREATH_NUMBER = process.env.TWILIO_PHONE_NUMBER || "+14704705493";

const MESSAGES = [
  `Hi, this is Breathe Easy following up on your call. Questions about filter service? Reply here or book a swap: https://breatheasy.ac/book. Reply STOP to opt out.`,
  `Quick reminder from Breathe Easy: Standard is $39/mo, Premium $59/mo, both include 2 HVAC units. Book in 2 minutes: https://breatheasy.ac/book. Reply STOP to opt out.`,
  `Breathe Easy here. Still weighing it? Ask me anything by text, or grab your first swap: https://breatheasy.ac/book. Reply STOP to opt out.`,
  `One thing most people don't know: a clogged filter makes your HVAC work harder and your power bill higher. Breathe Easy swaps them for you: https://breatheasy.ac/book. Reply STOP to opt out.`,
  `Last note from Breathe Easy, promise. If the timing is wrong now, save our number for when you need us. https://breatheasy.ac. Reply STOP to opt out.`,
];

const OPT_OUT = /(stop|unsubscribe|cancel|remove me|opt out)/i;

function twilioFetch(sid: string, token: string) {
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  return async (path: string) =>
    fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}${path}`, {
      headers: { Authorization: `Basic ${auth}` },
    }).then((r) => r.json());
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dryRun = url.searchParams.get("DRY_RUN") === "1";
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const secret = process.env.CRON_SECRET;
  const authed = isVercelCron || (secret && url.searchParams.get("secret") === secret);
  if (!authed) return Response.json({ error: "unauthorized" }, { status: 401 });

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return Response.json({ error: "twilio not configured" }, { status: 500 });

  const api = twilioFetch(sid, token);
  const since = new Date(Date.now() - 21 * 24 * HOURS).toISOString();

  // 1) Everyone who contacted us in last 21 days
  const [calls, msgs] = await Promise.all([
    api(`/Calls.json?To=${BREATH_NUMBER}&StartTime=${since}&PageSize=200`),
    api(`/Messages.json?PageSize=400`), // filter locally below (covers both directions)
  ]);

  const contacts = new Map<string, { firstContact: Date }>();
  for (const c of calls.calls || []) {
    const d = new Date(c.date_created);
    if (!contacts.has(c.from) || d < contacts.get(c.from)!.firstContact)
      contacts.set(c.from, { firstContact: d });
  }
  const allMsgs: any[] = msgs.messages || [];
  for (const m of allMsgs) {
    if (m.to !== BREATH_NUMBER && m.from !== BREATH_NUMBER) continue;
    const other = m.to === BREATH_NUMBER ? m.from : m.to;
    const d = new Date(m.date_created);
    if (d < new Date(since)) continue;
    if (other === contacts.get(other)?.firstContact) continue;
    if (!contacts.has(other) || d < contacts.get(other)!.firstContact)
      contacts.set(other, { firstContact: d });
  }

  const log: any[] = [];
  const now = Date.now();

  for (const [phone, { firstContact }] of contacts) {
    if (phone.length < 10) continue;
    const theirMsgs = allMsgs
      .filter((m) => m.from === phone)
      .sort((a, b) => +new Date(a.date_created) - +new Date(b.date_created));
    const ourMsgs = allMsgs
      .filter((m) => m.to === phone)
      .sort((a, b) => +new Date(a.date_created) - +new Date(b.date_created));

    // opt-out forever
    if (theirMsgs.some((m) => OPT_OUT.test(m.body || ""))) {
      log.push({ phone, action: "skip-optout" });
      continue;
    }

    // count our follow-up touches (body starts with known prefixes or any msg)
    const touches = ourMsgs.length;
    if (touches >= 5) {
      log.push({ phone, action: "skip-complete", touches });
      continue;
    }

    // pause if they replied recently (conversation is alive, human handles it)
    const lastInbound = theirMsgs.length ? +new Date(theirMsgs[theirMsgs.length - 1].date_created) : 0;
    if (lastInbound && now - lastInbound < PAUSE_AFTER_REPLY_HOURS * HOURS) {
      log.push({ phone, action: "skip-recent-reply" });
      continue;
    }

    // next touch due?
    const hoursSinceFirst = (now - +firstContact) / HOURS;
    const nextIdx = touches; // 0 sent -> send idx 0
    if (hoursSinceFirst < TOUCH_HOURS[nextIdx]) {
      log.push({ phone, action: "wait", hoursSinceFirst: +hoursSinceFirst.toFixed(1), nextTouchAt: TOUCH_HOURS[nextIdx] });
      continue;
    }

    const body = MESSAGES[nextIdx];
    if (dryRun) {
      log.push({ phone, action: "would-send", touch: nextIdx + 1, body: body.slice(0, 40) + "..." });
      continue;
    }
    // send
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: phone, From: BREATH_NUMBER, Body: body }),
    }).catch(() => {});
    log.push({ phone, action: "sent", touch: nextIdx + 1 });
  }

  return Response.json({ ranAt: new Date().toISOString(), contacts: contacts.size, actions: log });
}
