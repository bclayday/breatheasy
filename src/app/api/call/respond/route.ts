import { askOpenAI, fallbackAnswer, isBookingIntent, isExitIntent } from "@/lib/breatheasy";
import { gather, twiml, xml } from "@/lib/twiml";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const speech = String(form.get("SpeechResult") || "").trim();
  if (isExitIntent(speech)) return twiml("<Say>See you, breathe easy!</Say><Hangup/>");
  if (isBookingIntent(speech)) return twiml(gather("Absolutely. What is your full name?", "/api/call/booking?stage=name"));
  const answer = (await askOpenAI([{ role: "user", content: speech }], true)) || fallbackAnswer(speech);
  return twiml(`<Say>${xml(answer)}</Say>${gather("Anything else I can help with?", "/api/call/respond")}`);
}
