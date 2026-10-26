import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog-posts";
import { jalaliDisplayToIso } from "@/lib/jalali";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

/* ============================================================
   Sitemap — کاملاً دینامیک (هم‌سبک drpedrambakhshaei.com)

   ۱) مقاله‌ها: lastmod = تاریخ تحریری واقعیِ خود مقاله
      (شمسی → میلادی، ساعت ۰۰:۰۰ UTC). هر مقاله جدید که ایجنت‌ها
      یا ادمین منتشر کند، خودکار و بلافاصله در سایت‌مپ می‌آید و
      تاریخش با بقیه فرق دارد — دقیقاً مثل سایت مرجع.
   ۲) صفحات اصلی و نسخه EN: lastmod = لحظه تولید سایت‌مپ؛ هر بار
      گوگل/بینگ می‌کشد تاریخ و ساعت تازه می‌بیند (نشانه سایت زنده).
   ۳) این route هرگز ۵۰۰ نمی‌دهد: اگر دیتابیس شکست خورد، حداقل
      صفحات اصلی برگردانده می‌شوند.
   ۴) قالب متنی: مثل سایت مرجع — هر <url> فقط ۴ سطر تمیز
      (loc/lastmod/changefreq/priority) و بدون xhtml:link و
      بدون xmlns:xhtml. صفحات EN به‌صورت URL مستقل داخل همین
      سایت‌مپ می‌آیند تا هم‌چنان قابل کشف باشند.
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

  /* ---------- لحظه تولید سایت‌مپ — برای همه صفحات اصلی ---------- */
  const now = new Date();

  /* ---------- مقاله‌ها: lastmod = تاریخ تحریری واقعی هر مقاله ---------- */
  let blog: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    blog = posts.map((p) => {
      const day =
        toDay(p.date ? jalaliDisplayToIso(p.date) : null) ??
        toDay(p.updatedAt) ??
        toDay(p.publishedAt) ??
        FALLBACK_DAY;
      return {
        url: `${base}/blog/${p.slug}`,
        lastModified: new Date(`${day}T00:00:00.000Z`),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      };
    });
    /* جدیدترین مقاله اول — مثل سایت مرجع */
    blog.sort(
      (a, b) =>
        (b.lastModified as Date).getTime() - (a.lastModified as Date).getTime(),
    );
  } catch {
    /* دیتابیس در دسترس نیست — صفحات اصلی همچنان سرو می‌شوند */
  }

  /* ---------- صفحات اصلی فارسی ---------- */
  const main: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/jaw-surgery`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/surgery-care`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/chin-surgery`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/dental-implant`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/implant-pasdaran`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/costs`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/appointment`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.9 },
  ];

  /* ---------- نسخه انگلیسی (/en) — به‌صورت URL مستقل ----------
     لندینگ jaw-surgery-in-iran معادل فارسی ندارد؛ فقط en.
     قالب متنی مثل بقیه: loc/lastmod/changefreq/priority. */
  const en: MetadataRoute.Sitemap = [
    { url: `${base}/en`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/en/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/en/services`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/en/jaw-surgery-in-iran`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/en/costs`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/en/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/en/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  return [...main, ...en, ...blog];
}
