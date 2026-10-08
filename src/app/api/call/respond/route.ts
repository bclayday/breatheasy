import { askOpenAI, fallbackAnswer, isBookingIntent, isExitIntent } from "@/lib/breatheasy";
import { gather, say, twiml } from "@/lib/twiml";
import { saveQuestion } from "@/lib/questions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const speech = String(form.get("SpeechResult") || "").trim();
  if (speech) void saveQuestion(speech).catch(() => undefined);
  if (isExitIntent(speech)) return twiml(`${say("You got it. Take care, and breathe easy!")}<Hangup/>`);
  if (isBookingIntent(speech)) return twiml(gather("Love it, let\'s get you set up! What\'s your full name?", "/api/call/booking?stage=name"));
  const answer = (await askOpenAI([{ role: "user", content: speech }], true)) || fallbackAnswer(speech);
  return twiml(`${say(answer)}${gather("Anything else I can help with today?", "/api/call/respond")}`);
}
