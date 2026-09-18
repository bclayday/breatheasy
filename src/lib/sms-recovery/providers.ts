import type { AiReplyGenerator, SmsSender } from "./types";

export const sendTwilioSms: SmsSender = async (to, body, fromNumber) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = fromNumber || process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) throw new Error("Twilio SMS environment variables are not configured");
  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const baseUrl = process.env.APP_BASE_URL?.replace(/\/$/, "");
  if (baseUrl) params.set("StatusCallback", `${baseUrl}/api/sms/status`);
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!response.ok) throw new Error(`Twilio SMS failed (${response.status})`);
  const data = await response.json();
  return { sid: data.sid, status: data.status };
};

export const generateOpenAiReply: AiReplyGenerator = async (lead, config) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.25,
      max_tokens: 120,
      messages: [
        { role: "system", content: `${config.systemPrompt}\n\nBusiness facts:\n${config.servicesBlob}\nBooking link: ${config.bookingUrl}` },
        ...lead.messages.filter((message) => message.author !== "system").slice(-8).map((message) => ({ role: message.direction === "inbound" ? "user" : "assistant", content: message.body })),
      ],
    }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
};
