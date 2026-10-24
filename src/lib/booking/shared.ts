/* ============================================================
   ثابت‌های مشترک نوبت‌دهی — بدون وابستگی به سرور (Prisma)
   هم در API و هم در کامپوننت کلاینت import می‌شود.
   ============================================================ */

/* روز هفته ممنوع — مطب پنجشنبه و جمعه تعطیل است */
export const CLOSED_DOW = [4, 5];
/* حداکثر افق رزرو (روز) */
export const MAX_AHEAD_DAYS = 75;
/* ظرفیت هر بازه ساعت */
export const SLOT_CAPACITY = 2;
/* تعرفه پیش‌فرض ویزیت (تومان) — از پنل ادمین قابل تغییر */
export const DEFAULT_FEE_TOMAN = 900000;

export type SlotGroup = "afternoon" | "evening";

export interface SlotDef {
  id: string; // «15:00» — شناسه پایدار بازه
  label: string; // «۱۵:۰۰ تا ۱۵:۴۵»
  group: SlotGroup;
}

export const SLOT_GROUPS: Record<SlotGroup, { label: string; icon: "sun" | "moon" }> = {
  afternoon: { label: "بعدازظهر — ۱۵ تا ۱۷", icon: "sun" },
  evening: { label: "عصر — ۱۷ تا ۱۹", icon: "moon" },
};

export const SLOTS: SlotDef[] = [
  { id: "15:00", label: "۱۵:۰۰ تا ۱۵:۴۵", group: "afternoon" },
  { id: "15:45", label: "۱۵:۴۵ تا ۱۶:۳۰", group: "afternoon" },
  { id: "16:30", label: "۱۶:۳۰ تا ۱۷:۱۵", group: "afternoon" },
  { id: "17:15", label: "۱۷:۱۵ تا ۱۸:۰۰", group: "evening" },
  { id: "18:00", label: "۱۸:۰۰ تا ۱۸:۴۵", group: "evening" },
];

/* یک روز از پاسخ schedule API */
export interface DaySlot {
  id: string;
  label: string;
  group: SlotGroup;
  remaining: number;
}

export interface DaySchedule {
  iso: string;
  dow: number;
  jalali: string;
  doctor: string | null;
  open: boolean;
  past: boolean;
  tooFar: boolean;
  slots: DaySlot[];
}

/* ---------- کمکی‌های نمایش ---------- */

/** «۹۰۰٬۰۰۰» — ارقام فارسی با جداکننده هزارگان */
export function faNumber(n: number): string {
  return n.toLocaleString("fa-IR");
}

/** «۹۰۰» — تعرفه فشرده به هزار تومان برای زیر روزهای تقویم */
export function feeShort(feeToman: number): string {
  return (feeToman / 1000).toLocaleString("fa-IR", { maximumFractionDigits: 0 });
}
