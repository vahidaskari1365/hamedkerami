import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog-posts";
import { jalaliDisplayToIso } from "@/lib/jalali";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

/* ============================================================
   Sitemap — نسخه فول‌پروف برای Google Search Console

   سه قانونی که باگ‌های بازگشتی قبلی را برای همیشه می‌بندد:

   ۱) lastmod فقط «تاریخ واقعی محتوا» است، هیچ‌وقت زمانِ سرور:
      - برای مقاله‌ها: اول تاریخ تحریری شمسی مقاله (p.date) که
        پایدارِ مطلق است؛ نسخه قبلی اول updatedAt دیتابیس را
        می‌گرفت و هر بازسازی جدول/seed همه lastmodها را به لحظه
        insert می‌پراند (گوگل به lastmod متغیر اعتماد نمی‌کند و
        در Search Console رفتار غیرقابل پیش‌بینی می‌سازد).
      - برای صفحات اصلی: جدیدترین تاریخ واقعی محتوا.
   ۲) فرمت فقط «YYYY-MM-DD» — امن‌ترین شکل W3C برای GSC؛
      بدون میلی‌ثانیه و پسوند Z که بعضی ابزارها/validationها رد می‌کنند.
   ۳) این route هرگز ۵۰۰ نمی‌دهد: اگر دیتابیس یا هر چیز دیگری
      شکست خورد، حداقل صفحات اصلی برگردانده می‌شوند. (تاخیر/خطای
      «Couldn't fetch» گوگل از کول‌استارت Passenger است که با
      ورک‌فلو keep-warm حل شده است.)
   ============================================================ */

/** هر ورودی تاریخ را به «YYYY-MM-DD» امن تبدیل می‌کند؛ نامعتبر → null */
function toDay(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const t = new Date(value as string | number | Date).getTime();
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : null;
}

const FALLBACK_DAY = "2026-10-01";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  /* ---------- مقاله‌ها: lastmod پایدار = تاریخ تحریری ---------- */
  let blog: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    blog = posts.map((p) => {
      const lastModified =
        toDay(p.date ? jalaliDisplayToIso(p.date) : null) ??
        toDay(p.updatedAt) ??
        toDay(p.publishedAt) ??
        FALLBACK_DAY;
      return {
        url: `${base}/blog/${p.slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });
  } catch {
    /* دیتابیس در دسترس نیست — صفحات اصلی همچنان سرو می‌شوند */
  }

  /* ---------- صفحات اصلی: جدیدترین تاریخ واقعی محتوا ----------
     چون همه تاریخ‌ها اکنون تاریخ-تحریری و پایدارند، این مقدار هم
     بین درخواست‌ها ثابت می‌ماند — دقیقاً چیزی که گوگل می‌خواهد */
  const days = blog
    .map((b) => b.lastModified)
    .filter((d): d is string => typeof d === "string")
    .sort();
  const mainDay = days.length ? days[days.length - 1] : FALLBACK_DAY;

  const main: MetadataRoute.Sitemap = [
    { url: base, lastModified: mainDay, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/jaw-surgery`, lastModified: mainDay, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/chin-surgery`, lastModified: mainDay, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/dental-implant`, lastModified: mainDay, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/implant-pasdaran`, lastModified: mainDay, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, lastModified: mainDay, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services`, lastModified: mainDay, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/costs`, lastModified: mainDay, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/gallery`, lastModified: mainDay, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: mainDay, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: mainDay, changeFrequency: "yearly", priority: 0.7 },
  ];

  return [...main, ...blog];
}
