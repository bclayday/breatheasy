import { breatheEasySmsConfig, recoverMissedCall, recoveryStore, sendTwilioSms } from "@/lib/sms-recovery";
import { twiml } from "@/lib/twiml";

export const dynamic = "force-dynamic";

const RECOVERABLE = new Set(["no-answer", "busy", "failed"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const status = String(form.get("CallStatus") || "").toLowerCase();
  const direction = String(form.get("Direction") || "inbound").toLowerCase();
  const phone = String(form.get("From") || "").trim();
  if (!RECOVERABLE.has(status) || !direction.startsWith("inbound") || !phone) return twiml("");

  try {
    await recoverMissedCall({ phone, caller: String(form.get("CallerName") || phone) }, {
      store: recoveryStore, send: sendTwilioSms, config: breatheEasySmsConfig,
    });
  } catch (error) {
    console.error("Missed-call recovery failed", error);
  }
  return twiml("");
}
