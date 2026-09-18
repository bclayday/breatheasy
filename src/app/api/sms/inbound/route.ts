import { breatheEasySmsConfig, generateOpenAiReply, handleInboundSms, recoveryStore, sendTwilioSms } from "@/lib/sms-recovery";
import { twiml } from "@/lib/twiml";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const phone = String(form.get("From") || "").trim();
  const body = String(form.get("Body") || "").trim();
  if (!phone || !body) return twiml("");
  try {
    await handleInboundSms({ phone, caller: String(form.get("ProfileName") || phone), body }, {
      store: recoveryStore, send: sendTwilioSms, generateReply: generateOpenAiReply, config: breatheEasySmsConfig,
    });
  } catch (error) {
    console.error("Inbound SMS recovery failed", error);
  }
  return twiml("");
}
