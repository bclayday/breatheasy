import { gather, twiml } from "@/lib/twiml";

export const dynamic = "force-dynamic";

export async function POST() {
  return twiml(
    gather(
      'Hi there, thanks so much for calling Breathe Easy! <break time="300ms"/> I\'m the assistant here. What can I help you with today?',
      "/api/call/respond",
    ),
  );
}
