import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog-posts";
import { jalaliDisplayToIso } from "@/lib/jalali";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

/* ============================================================
   Sitemap داینامیک — آماده برای Google Search Console

   ⚠️ قانون طلایی lastmod (طبق مستندات رسمی گوگل):
   تاریخ lastmod باید «تاریخ واقعی آخرین تغییر محتوا» باشد،
   نه زمانِ الانِ سرور. اگر lastmod در هر درخواست عوض شود
   (new Date())، گوگل دیگر به آن اعتماد نمی‌کند و در
   Search Console رفتار غیرقابل پیش‌بینی ایجاد می‌کند.
   این نسخه از تاریخ واقعی هر مقاله استفاده می‌کند:
   ۱) updatedAt دیتابیس (اگر ادمین مقاله را ویرایش کرده باشد)
   ۲) createdAt دیتابیس
   ۳) تاریخ نمایشی شمسی مقاله («۲۸ مهر ۱۴۰۵») → تبدیل به ISO میلادی
   و برای صفحات اصلی = جدیدترین تاریخ محتوای واقعی (ثابت و قابل اعتماد)
   ============================================================ */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const posts = await getPublishedPosts();

  /* ---------- مقالات: lastmod واقعی و پایدار ---------- */
  const blog: MetadataRoute.Sitemap = posts.map((p) => {
    const dbDate = p.updatedAt ?? p.publishedAt;
    const lastModified =
      dbDate ??
      (p.date ? jalaliDisplayToIso(p.date) : null) ??
      "2026-10-01";
    return {
      url: `${base}/blog/${p.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    };
  });

  /* ---------- صفحات اصلی: جدیدترین تغییر واقعی محتوا ----------
     هر وقت مقاله یا محتوایی به‌روز شود این تاریخ جلو می‌رود و
     بین درخواست‌ها ثابت می‌ماند — دقیقا همان چیزی که گوگل می‌خواهد */
  const contentDates = blog
    .map((b) => b.lastModified)
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .map((d) => new Date(d).getTime());
  const latest = contentDates.length ? Math.max(...contentDates) : null;
  const mainLastModified = latest ? new Date(latest) : new Date("2026-10-01");

  const main: MetadataRoute.Sitemap = [
    { url: base, lastModified: mainLastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/jaw-surgery`, lastModified: mainLastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/chin-surgery`, lastModified: mainLastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/dental-implant`, lastModified: mainLastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/implant-pasdaran`, lastModified: mainLastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, lastModified: mainLastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services`, lastModified: mainLastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/costs`, lastModified: mainLastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/gallery`, lastModified: mainLastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: mainLastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: mainLastModified, changeFrequency: "yearly", priority: 0.7 },
  ];

  return [...main, ...blog];
}
