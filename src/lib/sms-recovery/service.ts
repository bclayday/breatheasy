import { missedCallText } from "./config";
import type { AiReplyGenerator, BrandConfig, MissedCallLead, RecoveryMessage, RecoveryStore, SmsSender } from "./types";

const FOUR_HOURS = 4 * 60 * 60 * 1000;
const STOP_WORDS = /^(stop|stopall|unsubscribe|cancel|end|quit)$/i;
const BOOKED_WORDS = /\b(booked|scheduled|appointment (?:is )?(?:set|confirmed))\b/i;

function message(direction: RecoveryMessage["direction"], author: RecoveryMessage["author"], body: string, twilioSid?: string, deliveryStatus?: string): RecoveryMessage {
  return { id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, direction, author, body, createdAt: new Date().toISOString(), twilioSid, deliveryStatus };
}

function newLead(phone: string): MissedCallLead {
  return { caller: phone, phone, startedAt: new Date().toISOString(), messages: [], status: "new", lastAiReply: null };
}

export async function recoverMissedCall(input: { phone: string; caller?: string }, deps: { store: RecoveryStore; send: SmsSender; config: BrandConfig }) {
  const claimedAt = new Date().toISOString();
  let blockedReason: "opted-out" | "rate-guard" | undefined;
  await deps.store.update(input.phone, (current) => {
    const next = current || newLead(input.phone);
    if (next.doNotText) blockedReason = "opted-out";
    else if (next.lastRecoverySentAt && Date.now() - Date.parse(next.lastRecoverySentAt) < FOUR_HOURS) blockedReason = "rate-guard";
    else next.lastRecoverySentAt = claimedAt;
    return next;
  });
  if (blockedReason) return { sent: false, reason: blockedReason } as const;
  const body = missedCallText(deps.config);
  let sent;
  try {
    sent = await deps.send(input.phone, body, deps.config.fromNumber);
  } catch (error) {
    await deps.store.update(input.phone, (lead) => {
      if (lead?.lastRecoverySentAt === claimedAt) delete lead.lastRecoverySentAt;
      return lead!;
    });
    throw error;
  }
  await deps.store.update(input.phone, (lead) => {
    const next = lead || newLead(input.phone);
    next.caller = input.caller || next.caller || input.phone;
    next.messages.push(message("outbound", "system", body, sent.sid, sent.status));
    return next;
  });
  return { sent: true, sid: sent.sid } as const;
}

export async function handleInboundSms(input: { phone: string; caller?: string; body: string }, deps: { store: RecoveryStore; send: SmsSender; generateReply: AiReplyGenerator; config: BrandConfig }) {
  const body = input.body.trim();
  let lead = await deps.store.update(input.phone, (current) => {
    const next = current || newLead(input.phone);
    next.caller = input.caller || next.caller || input.phone;
    next.messages.push(message("inbound", "caller", body));
    next.status = BOOKED_WORDS.test(body) ? "booked" : "engaged";
    return next;
  });

  if (STOP_WORDS.test(body)) {
    await deps.store.update(input.phone, (current) => ({ ...current!, doNotText: true, needsHuman: false, status: "closed" }));
    return { reply: null, optedOut: true };
  }
  if (lead.doNotText) return { reply: null, optedOut: true };
  if (lead.needsHuman) return { reply: null, needsHuman: true, lead };

  const aiReplies = lead.messages.filter((item) => item.author === "ai").length;
  const needsHuman = aiReplies >= 2;
  const reply = needsHuman
    ? `I’ll have our ${deps.config.businessName} team take it from here. What’s the best time for a quick callback?`
    : (await deps.generateReply(lead, deps.config)) || `Thanks for reaching out! You can book at ${deps.config.bookingUrl}, or send your name and service address and our team will follow up.`;
  const sent = await deps.send(input.phone, reply, deps.config.fromNumber);
  lead = await deps.store.update(input.phone, (current) => {
    const next = current!;
    next.messages.push(message("outbound", needsHuman ? "system" : "ai", reply, sent.sid, sent.status));
    if (!needsHuman) next.lastAiReply = reply;
    next.needsHuman = needsHuman;
    return next;
  });
  return { reply, needsHuman, lead };
}

export async function sendManualSms(input: { phone: string; body: string }, deps: { store: RecoveryStore; send: SmsSender; fromNumber?: string }) {
  const existing = await deps.store.get(input.phone);
  if (existing?.doNotText) throw new Error("This caller has opted out of text messages");
  const sent = await deps.send(input.phone, input.body, deps.fromNumber);
  return deps.store.update(input.phone, (current) => {
    const next = current || newLead(input.phone);
    next.messages.push(message("outbound", "agent", input.body, sent.sid, sent.status));
    next.needsHuman = false;
    next.status = "engaged";
    return next;
  });
}
