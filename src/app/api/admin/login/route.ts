import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  signSession,
  loginAllowed,
  loginSucceeded,
  SESSION_COOKIE,
  SESSION_TTL_SEC,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };
    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "نام کاربری و رمز عبور الزامی است" },
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
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { ok: false, error: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    loginSucceeded(`login:${ip}`);
    const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
    const token = signSession({ u: user.username, exp });

    const res = NextResponse.json({ ok: true, username: user.username });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SEC,
      secure: false, // پیش‌نمایش روی http سرو می‌شود
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}

/* رمز پیش‌فرض: اگر هیچ مدیری در دیتابیس نباشد، GET اولین مدیر را می‌سازد */
export async function GET() {
  try {
    const count = await db.adminUser.count();
    if (count === 0) {
      await db.adminUser.create({
        data: { username: "admin", passwordHash: hashPassword("kermani1403") },
      });
      return NextResponse.json({ ok: true, seeded: true });
    }
    return NextResponse.json({ ok: true, seeded: false });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
