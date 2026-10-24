import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { db } from "@/lib/db";
import { rateLimit, appSecret } from "@/lib/auth";
import { ensureBookingSchema } from "@/lib/booking/schema-guard";
import { getSmsProvider, smsConnected, normalizeMobile, isIranMobile } from "@/lib/booking/sms";

/* ============================================================
   درخواست کد تأیید ۵ رقمی برای شماره موبایل
   - نرخ: حداکثر ۳ کد در ۱۰ دقیقه برای هر شماره، ۸ در ۱۰ دقیقه هر IP
   - فاصله ارسال مجدد: ۶۰ ثانیه
   - اعتبار کد: ۳ دقیقه — کد هش‌شده ذخیره می‌شود (هرگز خام)
   - حالت تست (پنل SMS وصل نیست): devCode در پاسخ برگردانده می‌شود
   ============================================================ */

const OTP_TTL_SEC = 180;
const RESEND_COOLDOWN_SEC = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`otp-ip:${ip}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "تعداد درخواست‌ها زیاد است — کمی بعد دوباره تلاش کنید" },
      { status: 429 },
    );
  }

  try {
    await ensureBookingSchema();
    const body = (await req.json()) as { phone?: unknown };
    const mobile = normalizeMobile(typeof body.phone === "string" ? body.phone : "");
    if (!isIranMobile(mobile)) {
      return NextResponse.json(
        { ok: false, error: "شماره موبایل معتبر وارد کنید — مثل ۰۹۱۲۳۴۵۶۷۸۹" },
        { status: 400 },
      );
    }
    if (!rateLimit(`otp-mobile:${mobile}`, 3, 10 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: "برای این شماره زیاد کد ارسال شده — کمی بعد دوباره تلاش کنید" },
        { status: 429 },
      );
    }

    /* فاصله ارسال مجدد */
    const last = await db.otpCode.findFirst({
      where: { mobile, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_SEC * 1000) } },
      orderBy: { createdAt: "desc" },
    });
    if (last) {
      const wait = Math.ceil(
        (last.createdAt.getTime() + RESEND_COOLDOWN_SEC * 1000 - Date.now()) / 1000,
      );
      return NextResponse.json(
        { ok: false, error: `برای ارسال مجدد ${wait} ثانیه صبر کنید`, resendIn: wait },
        { status: 429 },
      );
    }

    /* تولید و ذخیره کد (هش‌شده) */
    const code = String(randomInt(10000, 99999));
    const codeHash = createHash("sha256")
      .update(`${mobile}:${code}:${appSecret()}`)
      .digest("hex");
    await db.otpCode.create({
      data: {
        mobile,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_TTL_SEC * 1000),
        ip,
      },
    });

    /* ارسال پیامک */
    const provider = getSmsProvider();
    const text = `کد تأیید نوبت‌دهی مطب دکتر حامد کرمانی: ${code}\nاین کد ۳ دقیقه معتبر است.`;
    const sent = await provider.send(mobile, text);
    if (!sent.ok) {
      console.error("[appointment/otp] sms send failed:", sent.error);
      return NextResponse.json(
        { ok: false, error: "ارسال پیامک ناموفق بود — دوباره تلاش کنید" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      expiresIn: OTP_TTL_SEC,
      resendIn: RESEND_COOLDOWN_SEC,
      smsConnected: smsConnected(),
      /* حالت تست — پنل SMS هنوز متصل نیست: کد برای تست نمایش داده می‌شود */
      ...(!smsConnected() ? { devCode: code } : {}),
    });
  } catch (e) {
    console.error("[appointment/otp] failed:", (e as Error).message);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
