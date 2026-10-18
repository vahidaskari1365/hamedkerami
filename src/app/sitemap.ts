import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog-posts";

export const dynamic = "force-dynamic";

/* ============================================================
   Sitemap داینامیک — همه URLهای واقعی سایت
   شامل صفحات اصلی، صفحات فرود سئو و تک‌تک مقالات وبلاگ.
   (فایل استاتیک قبلی URLهای هش‌دار داشت که گوگل نادیده می‌گرفت)
   ============================================================ */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://dromfs.com";
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

  const blog: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...main, ...blog];
}
