import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyPassword,
  dummyVerify,
  passwordVersion,
  signSession,
  loginAllowed,
  loginSucceeded,
  hashPassword,
  SESSION_COOKIE,
  SESSION_TTL_SEC,
} from "@/lib/auth";

/* ساخت حساب ادمین فقط از طریق prisma/seed.ts انجام می‌شود؛
   هیچ نقطه‌ی عمومی‌ای حساب پیش‌فرض با رمز معلوم نمی‌سازد. */

/* ── بازیابی اضطراری رمز ادمین — بدون هیچ نقطهٔ عمومی ──
   رمز seed یک‌بار تصادفی ساخته شده، فقط در کنسول چاپ شده و به‌صورت
   scrypt در دیتابیس ذخیره می‌شود — بازیابی‌پذیر نیست (طراحی امن).
   اگر مالک رمز را گم کند: در cPanel (Setup Node.js App → Environment
   variables) متغیر ADMIN_RESET_PASSWORD را می‌گذارد، یک بار در پنل
   لاگین می‌کند و بعد متغیر را حذف و اپ را Restart می‌کند.
   تا وقتی متغیر موجود است، رمز ادمین = مقدار متغیر (idempotent)؛
   با تغییر رمز، همهٔ نشست‌های قدیمی هم بلافاصله باطل می‌شوند (pv). */
async function applyEnvPasswordReset(): Promise<void> {
  const p = process.env.ADMIN_RESET_PASSWORD;
  if (!p || p.length < 10 || p.length > 256) return;
  try {
    const user = await db.adminUser.findUnique({ where: { username: "admin" } });
    if (user && !verifyPassword(p, user.passwordHash)) {
      await db.adminUser.update({
        where: { username: "admin" },
        data: { passwordHash: hashPassword(p) },
      });
    }
  } catch {
    /* خطای دیتابیس — جریان لاگین عادی ادامه پیدا می‌کند */
  }
}

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

    /* بازیابی اضطراری: اگر ADMIN_RESET_PASSWORD در env باشد، قبل از
       بررسی اعتبار روی رکورد ادمین اعمال می‌شود (توضیحات بالای فایل) */
    await applyEnvPasswordReset();

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
