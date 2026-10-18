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

export async function getPublishedPosts(): Promise<BlogArticle[]> {
  try {
    const rows = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    if (rows.length) {
      return rows.map((b) => ({
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
