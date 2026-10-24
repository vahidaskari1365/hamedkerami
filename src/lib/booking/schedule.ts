import { db } from "@/lib/db";
import { APPOINTMENT_DOCTORS } from "@/lib/data";
import { jalaliDisplay } from "@/lib/jalali";
import {
  CLOSED_DOW,
  MAX_AHEAD_DAYS,
  SLOT_CAPACITY,
  DEFAULT_FEE_TOMAN,
  SLOTS,
  type DaySchedule,
} from "@/lib/booking/shared";

/* ============================================================
   پیکربندی و محاسبه برنامه نوبت‌دهی (سمت سرور)
   مطب ۱۵ تا ۱۹ فعال است (پنجشنبه و جمعه تعطیل) — بر مبنای HOURS.
   هر روزِ حضور، یک پزشک دارد (روز → پزشک از APPOINTMENT_DOCTORS).
   ظرفیت هر بازه ۲ نوبت است؛ باقی‌مانده از دیتابیس شمرده می‌شود.
   ثابت‌های مشترک در lib/booking/shared.ts است (کلاینت‌امن).
   ============================================================ */

export {
  CLOSED_DOW,
  MAX_AHEAD_DAYS,
  SLOT_CAPACITY,
  DEFAULT_FEE_TOMAN,
  SLOTS,
} from "@/lib/booking/shared";

export interface BookingSettings {
  feeToman: number;
  operatorMobile: string;
  onlinePayment: boolean;
}

/** خواندن تنظیمات گروه «booking» از جدول Setting (با مقادیر پیش‌فرض) */
export async function getBookingSettings(): Promise<BookingSettings> {
  try {
    const row = await db.setting.findUnique({ where: { key: "booking" } });
    if (!row) return { feeToman: DEFAULT_FEE_TOMAN, operatorMobile: "", onlinePayment: false };
    const parsed = JSON.parse(row.value) as Record<string, unknown>;
    const fee = Number(parsed.feeToman);
    return {
      feeToman: Number.isFinite(fee) && fee >= 0 ? Math.trunc(fee) : DEFAULT_FEE_TOMAN,
      operatorMobile: typeof parsed.operatorMobile === "string" ? parsed.operatorMobile.trim() : "",
      onlinePayment: parsed.onlinePayment === true || parsed.onlinePayment === "on",
    };
  } catch {
    return { feeToman: DEFAULT_FEE_TOMAN, operatorMobile: "", onlinePayment: false };
  }
}

/* ---------- پزشکِ هر روز هفته (اولین پزشکی که آن روز حضور دارد) ---------- */
export function doctorForDow(dow: number): string | null {
  const found = APPOINTMENT_DOCTORS.find((d) => d.days.includes(dow));
  return found?.name ?? null;
}

/* ---------- ساخت برنامه «از روز خواسته‌شده» به‌مدت N روز با ظرفیت باقی‌مانده ---------- */
export async function buildSchedule(fromIso: string, days: number): Promise<{
  days: DaySchedule[];
  feeToman: number;
  capacity: number;
  onlinePayment: boolean;
}> {
  const settings = await getBookingSettings();

  /* مرز بازه — از ISO میلادی به Date محلی */
  const m = fromIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const from = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + days - 1);
  const toIso = `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, "0")}-${String(
    to.getDate(),
  ).padStart(2, "0")}`;

  /* شمارش رزروهای فعال هر بازه در بازه‌ی خواسته‌شده */
  const booked = await db.appointment.findMany({
    where: {
      dayIso: { gte: fromIso, lte: toIso },
      status: { not: "canceled" },
    },
    select: { dayIso: true, slot: true },
  });
  const counts = new Map<string, number>();
  for (const b of booked) {
    /* فقط بازه‌های استاندارد شمرده می‌شوند؛ نوبت‌های قدیمی بدون بازه دقیق تأثیری ندارند */
    if (!SLOTS.some((s) => b.slot === s.id)) continue;
    const key = `${b.dayIso}|${b.slot}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  /* امروزِ تهران — برای علامت‌گذاری روزهای گذشته */
  const todayIso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [ty, tm, td] = todayIso.split("-").map(Number);
  const today = new Date(ty, tm - 1, td);

  const days2: DaySchedule[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    const dow = d.getDay();
    const doctor = doctorForDow(dow);
    const open = !CLOSED_DOW.includes(dow) && doctor !== null;
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    days2.push({
      iso,
      dow,
      jalali: jalaliDisplay(d),
      doctor,
      open,
      past: diff < 0,
      tooFar: diff > MAX_AHEAD_DAYS,
      slots: SLOTS.map((s) => ({
        id: s.id,
        label: s.label,
        group: s.group,
        remaining: open
          ? Math.max(0, SLOT_CAPACITY - (counts.get(`${iso}|${s.id}`) ?? 0))
          : 0,
      })),
    });
  }

  return {
    days: days2,
    feeToman: settings.feeToman,
    capacity: SLOT_CAPACITY,
    onlinePayment: settings.onlinePayment,
  };
}
