import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/auth";
import { APPOINTMENT_DOCTORS, faToEnDigits } from "@/lib/data";
import { jalaliDisplay, tehranToday } from "@/lib/jalali";

/* ============================================================
   نوبت‌دهی آنلاین — ثبت درخواست رزرو
   اعتبارسنجی سمت سرور: دکتر معتبر، روز فعال همان دکتر،
   ممنوعیت پنجشنبه/جمعه و روزهای گذشته، محدودیت آینده.
   نوبت با status=pending ذخیره می‌شود؛ تأیید نهایی در پنل ادمین.
   شماره تماس: موبایل ایران (09…) یا بین‌المللی (+…) — فرم
   انگلیسی /en/contact هم به همین API متصل است.
   ============================================================ */

/* روز هفته ممنوع — مطب پنجشنبه و جمعه تعطیل است (مبنای HOURS) */
const CLOSED_DOW = [4, 5];
/* حداکثر افق رزرو (روز) — جلوگیری از رزروهای سال‌های بعد */
const MAX_AHEAD_DAYS = 75;

function doctorFor(name: string) {
  return APPOINTMENT_DOCTORS.find((d) => d.name === name);
}

const appointmentSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد").max(120),
  phone: z
    .string()
    .transform((s) => faToEnDigits(s).replace(/[\s()-]/g, ""))
    .pipe(
      z.string().regex(
        /^(\+\d{8,15}|0\d{10})$/,
        "شماره تماس معتبر نیست — موبایل ایران مثل ۰۹۱۲۳۴۵۶۷۸۹ یا بین‌المللی با +98 و…",
      ),
    ),
  doctor: z.string().max(120),
  dayIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "روز نامعتبر است"),
  slot: z.string().max(60).optional().default(""),
  note: z.string().max(1500).optional().default(""),
  /* تله‌ی ربات — فیلد مخفی فرم؛ پرشدنش یعنی ربات */
  website: z.string().max(300).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  /* حداکثر ۳ درخواست نوبت در ۱۰ دقیقه از هر IP */
  if (!rateLimit(`appointment:${ip}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "تعداد درخواست‌ها زیاد است — کمی بعد دوباره تلاش کنید" },
      { status: 429 },
    );
  }
  try {
    const body = await req.json();
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست";
      return NextResponse.json({ ok: false, error: first }, { status: 400 });
    }
    /* ربات فیلد مخفی را پر کرده — پاسخ موفق بی‌صدا، بدون ذخیره */
    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const { name, phone, doctor, dayIso, slot, note } = parsed.data;
    const doc = doctorFor(doctor);
    if (!doc) {
      return NextResponse.json(
        { ok: false, error: "پزشک انتخابی معتبر نیست" },
        { status: 400 },
      );
    }

    /* روز انتخابی — بررسی با تقویم محلی تهران */
    const m = dayIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const day = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
    if (!day || Number.isNaN(day.getTime())) {
      return NextResponse.json({ ok: false, error: "روز نامعتبر است" }, { status: 400 });
    }
    const today = tehranToday();
    const diffDays = Math.round((day.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) {
      return NextResponse.json(
        { ok: false, error: "روز گذشته را نمی‌توان انتخاب کرد" },
        { status: 400 },
      );
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
    if (!doc.days.includes(dow)) {
      return NextResponse.json(
        { ok: false, error: `${doctor} در این روز مطب نیست — روزهای حضور را در تقویم ببینید` },
        { status: 400 },
      );
    }

    const row = await db.appointment.create({
      data: {
        name,
        phone,
        doctor,
        dayIso,
        dayJalali: jalaliDisplay(day),
        slot: slot ?? "",
        note: note ?? "",
        status: "pending",
      },
    });

    return NextResponse.json({
      ok: true,
      dayJalali: row.dayJalali,
      doctor: row.doctor,
      slot: row.slot,
    });
  } catch (e) {
    console.error("[appointment] create failed:", (e as Error).message);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
