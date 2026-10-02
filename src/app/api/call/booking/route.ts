import { isExitIntent } from "@/lib/breatheasy";
import { saveLead } from "@/lib/leads";
import { gather, twiml, xml } from "@/lib/twiml";

export const dynamic = "force-dynamic";

function digitsOf(speech: string): string {
  const spokenMap: Record<string, string> = { zero: "0", oh: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9" };
  let d = speech.toLowerCase().split(/[\s,.]+/).map((w) => spokenMap[w] ?? (/\d/.test(w) ? w : "")).join("");
  if (d.length === 10) d = `+1${d}`;
  else if (d.length === 11 && d.startsWith("1")) d = `+${d}`;
  return d.startsWith("+") ? d : "";
}

async function sendConfirmSms(to: string, name: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER || "+14704705493";
  if (!sid || !token || !to) return;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = `Hi ${name}, this is Breathe Easy. Thanks for booking! We have you down for filter service and our team will text you within one business day to lock in your visit time. Questions? Just reply here. https://breatheasy.ac`;
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  }).catch(() => {});
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const stage = url.searchParams.get("stage") || "name";
  const form = await request.formData();
  const callerFrom = String(form.get("From") || "");
  const speech = String(form.get("SpeechResult") || "").trim();
  if (isExitIntent(speech)) return twiml("<Say>See you, breathe easy!</Say><Hangup/>");
  if (!speech) return twiml(gather(stage === "name" ? "Please say your full name." : "Please say your phone number.", request.url));
  if (stage === "name") return twiml(gather("Thanks. What is the best phone number to reach you?", `/api/call/booking?stage=phone&name=${encodeURIComponent(speech)}`));
  const name = url.searchParams.get("name") || "Caller";
  await saveLead({ type: "Calls", name, phone: speech, transcript: `Booking call from ${name}` });

  // Instant SMS confirmation to the number they gave (fall back to caller ID)
  const target = digitsOf(speech) || callerFrom;
  sendConfirmSms(target, name); // fire and forget

  return twiml(`<Say>${xml(`Thanks, ${name}. Our team will confirm your service details and schedule soon. We just texted you a confirmation. See you, breathe easy!`)}</Say><Hangup/>`);
}
