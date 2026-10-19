import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog-posts";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

/* ============================================================
   Sitemap داینامیک — آماده برای Google Search Console
   force-dynamic: هر بار که گوگل /sitemap.xml را می خواند،
   لیست از دیتابیس خوانده می شود — یعنی به محض انتشار یک
   مقاله جدید، URL آن خودکار در سایت مپ ظاهر می شود و
   نیازی به آپدیت دستی نیست. فقط یک بار در سرچ کنسول آدرس
   https://dromfs.com/sitemap.xml را Submit کنید؛ بعد از آن
   گوگل خودش به صورت دوره ای دوباره می خواند.
   lastmod مقالات = تاریخ واقعی آخرین ویرایش هر پست
   ============================================================ */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now = new Date();

  const posts = await getPublishedPosts();

  const main: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/jaw-surgery`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/chin-surgery`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/dental-implant`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/implant-pasdaran`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/costs`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];

  /* مقالات: lastmod واقعی — تاریخ آخرین ویرایش هر مقاله در پنل */
  const blog: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt ?? p.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...main, ...blog];
}
