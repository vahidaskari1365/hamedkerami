import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, appSecret } from "@/lib/auth";
import { ensureBookingSchema } from "@/lib/booking/schema-guard";
import {
  SLOTS,
  SLOT_CAPACITY,
  MAX_AHEAD_DAYS,
  CLOSED_DOW,
  doctorForDow,
  getBookingSettings,
} from "@/lib/booking/schedule";
import { normalizeMobile, isIranMobile, smsConnected } from "@/lib/booking/sms";
import { notifyBooking } from "@/lib/booking/notify";
import { SITE, faToEnDigits } from "@/lib/data";
import { jalaliDisplay, tehranToday } from "@/lib/jalali";

/* ============================================================
   تأیید کد و ثبت قطعی نوبت — مرحله پایانی رزرو
   ۱) کد ۵ رقمی بررسی می‌شود (هش + timing-safe، حداکثر ۵ تلاش)
   ۲) اعتبار روز/بازه/ظرفیت دوباره سمت سرور چک می‌شود
   ۳) نوبت با status=confirmed و کد رهگیری یکتا ثبت می‌شود
   ۴) پیام اپراتور + پیام تأیید بیمار صف/ارسال می‌شود
   ============================================================ */

const OTP_MAX_ATTEMPTS = 5;

/* الفبای کد رهگیری — بدون کاراکترهای قابل اشتباه (0/O، 1/I، …) */
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function makeTrackingCode(): string {
  const bytes = randomBytes(6);
  let out = "KB-";
  for (let i = 0; i < 6; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

const verifySchema = z.object({
  phone: z
    .string()
    .transform((s) => normalizeMobile(s))
    .refine(isIranMobile, "شماره موبایل معتبر نیست"),
  code: z
    .string()
    .transform((s) => faToEnDigits(s).replace(/\D/g, ""))
    .refine((s) => s.length === 5, "کد ۵ رقمی را کامل وارد کنید"),
  name: z.string().min(2, "نام بیمار را کامل وارد کنید").max(120),
  latinName: z.string().max(120).optional().default(""),
  gender: z.enum(["female", "male", ""]).optional().default(""),
  birthYear: z
    .string()
    .transform((s) => faToEnDigits(s).replace(/\D/g, "").slice(0, 4))
    .optional()
    .default(""),
  dayIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "روز نامعتبر است"),
  slot: z.string().max(10),
  paymentMethod: z.enum(["clinic", "online"]).optional().default("clinic"),
  note: z.string().max(1500).optional().default(""),
  website: z.string().max(300).optional().nullable(), /* تله ربات */
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`verify-ip:${ip}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "تعداد درخواست‌ها زیاد است — کمی بعد دوباره تلاش کنید" },
      { status: 429 },
    );
  }

  try {
    await ensureBookingSchema();
    const parsed = verifySchema.safeParse(await req.json());
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست";
      return NextResponse.json({ ok: false, error: first }, { status: 400 });
    }
    /* ربات فیلد مخفی را پر کرده — پاسخ موفق بی‌صدا */
    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }
    const { phone, code, name, latinName, gender, birthYear, dayIso, slot, paymentMethod, note } =
      parsed.data;

    /* ---------- ۱) بررسی کد OTP ---------- */
    const otp = await db.otpCode.findFirst({
      where: { mobile: phone, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) {
      return NextResponse.json(
        { ok: false, error: "کد فعالی پیدا نشد — کد جدید درخواست کنید" },
        { status: 400 },
      );
    }
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json(
        { ok: false, error: "تلاش‌های زیادی انجام شده — کد جدید درخواست کنید" },
        { status: 429 },
      );
    }
    const expected = createHash("sha256")
      .update(`${phone}:${code}:${appSecret()}`)
      .digest("hex");
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(otp.codeHash, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      const left = OTP_MAX_ATTEMPTS - otp.attempts - 1;
      return NextResponse.json(
        { ok: false, error: `کد وارد شده درست نیست${left > 0 ? ` — ${left} تلاش باقی مانده` : ""}` },
        { status: 400 },
      );
    }

    /* ---------- ۲) اعتبارسنجی مجدد روز و بازه ---------- */
    const slotDef = SLOTS.find((s) => s.id === slot);
    if (!slotDef) {
      return NextResponse.json({ ok: false, error: "بازه ساعت نامعتبر است" }, { status: 400 });
    }
    const m = dayIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const day = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
    if (!day || Number.isNaN(day.getTime())) {
      return NextResponse.json({ ok: false, error: "روز نامعتبر است" }, { status: 400 });
    }
    const today = tehranToday();
    const diffDays = Math.round((day.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) {
      return NextResponse.json({ ok: false, error: "روز گذشته قابل رزرو نیست" }, { status: 400 });
    }
    if (diffDays > MAX_AHEAD_DAYS) {
      return NextResponse.json(
        { ok: false, error: `فقط تا ${MAX_AHEAD_DAYS} روز آینده قابل رزرو است` },
        { status: 400 },
      );
    }
    const dow = day.getDay();
    if (CLOSED_DOW.includes(dow)) {
      return NextResponse.json(
        { ok: false, error: "مطب پنجشنبه و جمعه تعطیل است" },
        { status: 400 },
      );
    }
    const doctor = doctorForDow(dow);
    if (!doctor) {
      return NextResponse.json(
        { ok: false, error: "این روز مطب پذیرش ندارد — روز دیگری انتخاب کنید" },
        { status: 400 },
      );
    }

    /* ---------- ۳) ظرفیت + ثبت نوبت (تراکنش) ---------- */
    const settings = await getBookingSettings();
    const dayJalali = jalaliDisplay(day);

    const created = await db.$transaction(async (tx) => {
      const taken = await tx.appointment.count({
        where: { dayIso, slot, status: { not: "canceled" } },
      });
      if (taken >= SLOT_CAPACITY) return null;
      /* کد رهگیری یکتا */
      for (let i = 0; i < 5; i++) {
        const trackingCode = makeTrackingCode();
        const clash = await tx.appointment.findFirst({ where: { trackingCode } });
        if (clash) continue;
        return tx.appointment.create({
          data: {
            name: name.trim(),
            phone,
            doctor,
            dayIso,
            dayJalali,
            slot,
            note: note.trim(),
            status: "confirmed",
            latinName: latinName.trim(),
            gender,
            birthYear,
            visitType: "in_person",
            feeToman: settings.feeToman,
            paymentMethod,
            trackingCode,
          },
        });
      }
      throw new Error("tracking code generation failed");
    });

    if (!created) {
      return NextResponse.json(
        { ok: false, error: "متأسفانه این بازه همین حالا پر شد — بازه دیگری انتخاب کنید" },
        { status: 409 },
      );
    }

    /* مصرف کد OTP — فقط بعد از ثبت موفق */
    await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    /* ---------- ۴) اطلاع‌رسانی اپراتور و بیمار ---------- */
    const slotLabel = slotDef.label;
    await notifyBooking(
      {
        id: created.id,
        trackingCode: created.trackingCode,
        name: created.name,
        phone: created.phone,
        doctor: created.doctor,
        dayJalali: created.dayJalali,
        slotLabel,
        feeToman: created.feeToman,
        paymentMethod: created.paymentMethod,
      },
      settings,
    );

    return NextResponse.json({
      ok: true,
      trackingCode: created.trackingCode,
      dayJalali: created.dayJalali,
      doctor: created.doctor,
      slotLabel,
      feeToman: created.feeToman,
      paymentMethod: created.paymentMethod,
      address: SITE.address,
      smsConnected: smsConnected(),
    });
  } catch (e) {
    console.error("[appointment/verify] failed:", (e as Error).message);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
