import { isAuthorized } from "@/lib/admin-auth";
import { breatheEasySmsConfig, recoveryStore, sendManualSms, sendTwilioSms } from "@/lib/sms-recovery";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = await request.json();
    const phone = typeof input.phone === "string" ? input.phone.trim() : "";
    const body = typeof input.body === "string" ? input.body.trim() : "";
    if (!phone || !body || body.length > 1000) return Response.json({ error: "Phone and a message of 1–1000 characters are required" }, { status: 400 });
    const lead = await sendManualSms({ phone, body }, { store: recoveryStore, send: sendTwilioSms, fromNumber: breatheEasySmsConfig.fromNumber });
    return Response.json({ lead });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to send message" }, { status: 500 });
  }
}
