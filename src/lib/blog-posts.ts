import { db } from "@/lib/db";
import { BLOG_POSTS } from "@/lib/data";

/* ============================================================
   خواندن مقالات وبلاگ — دیتابیس با fallback به داده ثابت
   هر مقاله URL اختصاصی دارد: /blog/<slug>  (سئو + AEO)
   ============================================================ */

export type BlogArticle = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  date: string; // تاریخ شمسی نمایشی
  publishedAt: string | null; // ISO برای Schema
  updatedAt: string | null;
};

/* ============================================================
   مقالات پنهان‌شده — ردیفشان در دیتابیس می‌ماند اما از سایت
   (ایندکس، صفحه مقاله، سایت‌مپ، llms.txt) حذف می‌شوند.
   jaw-surgery-cost-1406: اشتباهاً ۴ آبان ۱۴۰۵ منتشر شد (سال جاری
   ۱۴۰۵ است؛ مقاله هزینه ۱۴۰۵ زنده است و انتشار دوباره = کانیبالی).
   نسخه آماده ۱۴۰۶ در content-queue/evergreen/ نگه‌داری می‌شود و
   از ۱ فروردین ۱۴۰۶ (۲۰۲۷-۰۳-۲۱) با notBefore در topics.ts
   مجاز به انتشار است. در آن زمان فقط از این Set خارج شود.
   ============================================================ */
const HIDDEN_SLUGS: ReadonlySet<string> = new Set(["jaw-surgery-cost-1406"]);

export async function getPublishedPosts(): Promise<BlogArticle[]> {
  try {
    const rows = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    if (rows.length) {
      return rows
        .filter((b) => !HIDDEN_SLUGS.has(b.slug))
        .map((b) => ({
          slug: b.slug,
          title: b.title,
          excerpt: b.excerpt,
          body: b.body,
          cover: b.cover,
          date: b.date,
          publishedAt: b.createdAt?.toISOString() ?? null,
          updatedAt: b.updatedAt?.toISOString() ?? null,
        }));
    }
  } catch {
    /* دیتابیس در دسترس نیست — fallback */
  }
  return BLOG_POSTS.map((b) => ({
    ...b,
    publishedAt: null,
    updatedAt: null,
  }));
}

export async function getBlogPost(slug: string): Promise<BlogArticle | null> {
  /* مقاله پنهان — مثل عدم وجود رفتار می‌شود (404) */
  if (HIDDEN_SLUGS.has(slug)) return null;
  try {
    const b = await db.blogPost.findUnique({ where: { slug } });
    if (b && b.published) {
      return {
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        body: b.body,
        cover: b.cover,
        date: b.date,
        publishedAt: b.createdAt?.toISOString() ?? null,
        updatedAt: b.updatedAt?.toISOString() ?? null,
      };
    }
  } catch {
    /* fallback */
  }
  const fb = BLOG_POSTS.find((p) => p.slug === slug);
  return fb
    ? { ...fb, publishedAt: null, updatedAt: null }
    : null;
}
