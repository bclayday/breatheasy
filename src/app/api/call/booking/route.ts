import { isExitIntent } from "@/lib/breatheasy";
import { saveLead } from "@/lib/leads";
import { gather, twiml, xml } from "@/lib/twiml";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const stage = url.searchParams.get("stage") || "name";
  const form = await request.formData();
  const speech = String(form.get("SpeechResult") || "").trim();
  if (isExitIntent(speech)) return twiml("<Say>See you, breathe easy!</Say><Hangup/>");
  if (!speech) return twiml(gather(stage === "name" ? "Please say your full name." : "Please say your phone number.", request.url));
  if (stage === "name") return twiml(gather("Thanks. What is the best phone number to reach you?", `/api/call/booking?stage=phone&name=${encodeURIComponent(speech)}`));
  const name = url.searchParams.get("name") || "Caller";
  await saveLead({ type: "Calls", name, phone: speech, transcript: `Booking call from ${name}` });
  return twiml(`<Say>${xml(`Thanks, ${name}. Our team will confirm your service details and schedule soon. See you, breathe easy!`)}</Say><Hangup/>`);
}
