import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "./auth";

/** خواندن نشست ادمین از کوکی — null یعنی دسترسی ندارد */
export async function requireAdmin(): Promise<{ u: string } | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
