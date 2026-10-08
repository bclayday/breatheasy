// Warm, natural voice for the Breathe Easy line (Amazon Polly neural via Twilio)
export const VOICE = "Polly.Joanna-Neural";
export const LANG = "en-US";

export const xml = (value: string) => value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);

// Say with the warm neural voice + slightly relaxed pacing for a friendlier feel
export function say(prompt: string): string {
  return `<Say voice="${VOICE}" language="${LANG}"><prosody rate="96%">${xml(prompt)}</prosody></Say>`;
}

export function twiml(body: string): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export function gather(prompt: string, action: string): string {
  return `<Gather input="speech" action="${xml(action)}" method="POST" speechTimeout="auto">${say(prompt)}</Gather>${say(prompt)}<Redirect method="POST">${xml(action)}</Redirect>`;
}
