/* ============================================================
   تبدیل تاریخ شمسی (جلالی) به میلادی — بدون وابستگی خارجی
   الگوریتم استاندارد (منبع: jalaali.js — الگوریتم عمومی و آزاد)
   کاربرد: datePublished اسکیمای مقاله‌ها و lastmod سایت‌مپ
   تاریخ نمایشی مقاله‌ها شمسی است (مثل «۲۸ مهر ۱۴۰۵») و برای
   اسکیما/Sitemap باید ISO میلادی معتبر تولید شود.
   ============================================================ */

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** نام ماه‌های شمسی (فروردین=۱ … اسفند=۱۲) — برای تقویم نوبت‌دهی */
export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/** تبدیل جلالی به میلادی — خروجی [سال، ماه، روز] میلادی */
export function jalaliToGregorian(
  jy: number,
  jm: number,
  jd: number,
): [number, number, number] {
  let days =
    -355668 +
    365 * (jy + 1595) +
    Math.floor((jy + 1595) / 33) * 8 +
    Math.floor((((jy + 1595) % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const md = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 12 && gd > md[gm]) {
    gd -= md[gm];
    gm++;
  }
  return [gy, gm + 1, gd];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** تبدیل میلادی به جلالی — ورودی [سال، ماه، روز] میلادی، خروجی [سال، ماه، روز] جلالی */
export function gregorianToJalali(
  gy: number,
  gm: number,
  gd: number,
): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

/** طول ماه جلالی — با مقایسه روز اول دو ماه متوالی (بدون نیاز به تابع کبیسه) */
export function jalaliMonthLength(jy: number, jm: number): number {
  const nextY = jm === 12 ? jy + 1 : jy;
  const nextM = jm === 12 ? 1 : jm + 1;
  const [gy1, gm1, gd1] = jalaliToGregorian(jy, jm, 1);
  const [gy2, gm2, gd2] = jalaliToGregorian(nextY, nextM, 1);
  const t1 = Date.UTC(gy1, gm1 - 1, gd1);
  const t2 = Date.UTC(gy2, gm2 - 1, gd2);
  return Math.round((t2 - t1) / 86400000);
}

/** نام روز هفته از Date (۰=یکشنبه … ۶=شنبه — مطابق getDay جاوااسکریپت) */
const WEEKDAYS = ["یکشنبه", "دوشنبه", "سه\u200cشنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
export function weekdayName(date: Date): string {
  return WEEKDAYS[date.getDay()] ?? "";
}

/** «یکشنبه ۱۷ آبان ۱۴۰۵» از Date — نمایش شمسی کامل با روز هفته */
export function jalaliDisplay(date: Date): string {
  const [jy, jm, jd] = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  /* useGrouping:false — سال چهاررقمی نباید جداکننده هزارگان بگیرد (۱٬۴۰۵ ✗) */
  const fa = (n: number) => n.toLocaleString("fa-IR", { useGrouping: false });
  return `${WEEKDAYS[date.getDay()]} ${fa(jd)} ${JALALI_MONTHS[jm - 1]} ${fa(jy)}`;
}

/** «YYYY-MM-DD» میلادی از Date (بدون تایم‌زون — بر پایه اجزای محلی) */
export function localIsoDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** امروزِ تهران — خروجی Date با اجزای روزِ محلی تهران (برای تقویم نوبت) */
export function tehranToday(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return new Date(get("year"), get("month") - 1, get("day"));
}

/**
 * «۲۸ مهر ۱۴۰۵» (یا با ارقام لاتین) → «2026-10-20»
 * اگر قابل پارس نبود null برمی‌گرداند تا فراخواننده fallback داشته باشد.
 */
export function jalaliDisplayToIso(display: string): string | null {
  if (!display) return null;
  const latin = display.replace(
    /[۰-۹]/g,
    (d) => String(PERSIAN_DIGITS.indexOf(d)),
  );
  const m = latin.match(/(\d{1,2})\s*([\u0600-\u06FF]+)\s*(\d{4})/);
  if (!m) return null;
  const day = Number(m[1]);
  const monthName = m[2].replace(/\u200c/g, "").trim();
  const year = Number(m[3]);
  /* تطابق نرم نام ماه — پیشوند مشترک کافی است (اردیبهشت/مرداد و...) */
  const mi = JALALI_MONTHS.findIndex(
    (mo) => mo === monthName || monthName.startsWith(mo) || mo.startsWith(monthName),
  );
  if (mi === -1 || day < 1 || day > 31) return null;
  const [gy, gm, gd] = jalaliToGregorian(year, mi + 1, day);
  return `${gy}-${pad(gm)}-${pad(gd)}`;
}
