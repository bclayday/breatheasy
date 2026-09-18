import { recoveryStore } from "@/lib/sms-recovery";
import { twiml } from "@/lib/twiml";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const sid = String(form.get("MessageSid") || "");
  const status = String(form.get("MessageStatus") || "");
  if (sid && status) await recoveryStore.updateDelivery(sid, status);
  return twiml("");
}
