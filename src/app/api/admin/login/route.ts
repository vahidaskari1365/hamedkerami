import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyPassword,
  dummyVerify,
  passwordVersion,
  signSession,
  loginAllowed,
  loginSucceeded,
  SESSION_COOKIE,
  SESSION_TTL_SEC,
} from "@/lib/auth";

/* ساخت حساب ادمین فقط از طریق prisma/seed.ts انجام می‌شود؛
   هیچ نقطه‌ی عمومی‌ای حساب پیش‌فرض با رمز معلوم نمی‌سازد. */

export async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return NextResponse.json(
        { ok: false, error: "نام کاربری و رمز عبور الزامی است" },
        { status: 400 }
      );
    }
    if (username.length > 64 || password.length > 256) {
      return NextResponse.json(
        { ok: false, error: "نام کاربری یا رمز عبور نامعتبر است" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!loginAllowed(`login:${ip}`)) {
      return NextResponse.json(
        { ok: false, error: "تلاش‌های زیاد — ۱۰ دقیقه بعد دوباره امتحان کنید" },
        { status: 429 }
      );
    }

    const user = await db.adminUser.findUnique({ where: { username } });
    const valid = user !== null && verifyPassword(password, user.passwordHash);
    if (!user) {
      /* برابرکردن زمان پاسخ با حالت رمز اشتباه */
      dummyVerify(password);
    }
    if (!valid || !user) {
      return NextResponse.json(
        { ok: false, error: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    loginSucceeded(`login:${ip}`);
    const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
    const token = signSession({
      u: user.username,
      exp,
      pv: passwordVersion(user.passwordHash),
    });

    const res = NextResponse.json({ ok: true, username: user.username });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SEC,
      /* روی HTTPS واقعی کوکی فقط با Secure ارسال می‌شود */
      secure: (req.headers.get("x-forwarded-proto") || "").includes("https"),
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
