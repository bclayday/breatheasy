import { createAdminToken, isValidPasscode } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let passcode = "";
  try {
    passcode = String((await request.json()).passcode || "");
  } catch { /* handled as unauthorized */ }

  if (!isValidPasscode(passcode)) {
    return Response.json({ error: "Invalid passcode" }, { status: 401 });
  }
  return Response.json({ token: createAdminToken(passcode) });
}
