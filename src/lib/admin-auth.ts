import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

function secret() {
  return process.env.ADMIN_PASSCODE || "";
}

export function createAdminToken(passcode: string): string {
  return createHmac("sha256", secret()).update(passcode).digest("hex");
}

export function isValidPasscode(passcode: string): boolean {
  const expected = Buffer.from(secret());
  const supplied = Buffer.from(passcode);
  return expected.length > 0 && expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function isAuthorized(request: Request): boolean {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expected = createAdminToken(secret());
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return Boolean(secret()) && suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}
