import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const AUTH_COOKIE = "pothik_admin_session";

export async function verifyAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret || secret.length < 32) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}
