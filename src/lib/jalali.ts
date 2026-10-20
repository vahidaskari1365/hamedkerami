/* ============================================================
   تبدیل تاریخ شمسی (جلالی) به میلادی — بدون وابستگی خارجی
   الگوریتم استاندارد (منبع: jalaali.js — الگوریتم عمومی و آزاد)
   کاربرد: datePublished اسکیمای مقاله‌ها و lastmod سایت‌مپ
   تاریخ نمایشی مقاله‌ها شمسی است (مثل «۲۸ مهر ۱۴۰۵») و برای
   اسکیما/Sitemap باید ISO میلادی معتبر تولید شود.
   ============================================================ */

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

const MONTHS = [
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
  const mi = MONTHS.findIndex(
    (mo) => mo === monthName || monthName.startsWith(mo) || mo.startsWith(monthName),
  );
  if (mi === -1 || day < 1 || day > 31) return null;
  const [gy, gm, gd] = jalaliToGregorian(year, mi + 1, day);
  return `${gy}-${pad(gm)}-${pad(gd)}`;
}
