import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, passwordVersion, SESSION_COOKIE } from "./auth";

/** خواندن نشست ادمین از کوکی — null یعنی دسترسی ندارد
 *  علاوه بر امضای رمزنگاشتی، نسخه‌ی رمز (pv) را با دیتابیس تطبیق می‌دهد
 *  تا با تغییر رمز، همه‌ی نشست‌های قبلی فوراً باطل شوند */
export async function requireAdmin(): Promise<{ u: string } | null> {
  const store = await cookies();
  const session = verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  try {
    const user = await db.adminUser.findUnique({ where: { username: session.u } });
    if (!user) return null;
    /* توکن‌های بدون pv (قدیمی) رد می‌شوند */
    if (!session.pv || session.pv !== passwordVersion(user.passwordHash)) return null;
    return { u: session.u };
  } catch {
    return null;
  }
}
