import { gather, twiml } from "@/lib/twiml";

export const dynamic = "force-dynamic";

export async function POST() {
  return twiml(gather("Thanks for calling BreathEasy. How can I help you today?", "/api/call/respond"));
}
