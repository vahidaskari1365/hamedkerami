/* ============================================================
   Instrumentation — هوک استارت سرور Next.js
   ۱) seed مقالات ثابت (BLOG_ARTICLES) در دیتابیس — تا بازنویسی
      مقالات با هر دیپلوی روی پروداکشن هم اعمال شود (upsert idempotent)
   ۲) استارت زمان‌بند ایجنت‌های بلاگ (۰۷:۰۰ تهران)
   فقط در ران‌تایم nodejs اجرا می‌شود (نه edge).
   ============================================================ */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { db } = await import("@/lib/db");
    const { BLOG_ARTICLES } = await import("@/lib/blog-articles");

    /* seed/upsert مقالات شاخه ثابت — فقط اگر محتوایشان عوض شده باشد */
    let seeded = 0;
    for (const a of BLOG_ARTICLES) {
      try {
        const existing = await db.blogPost.findUnique({ where: { slug: a.slug } });
        if (!existing) {
          await db.blogPost.create({
            data: {
              slug: a.slug,
              title: a.title,
              excerpt: a.excerpt,
              body: a.body,
              cover: a.cover,
              date: a.date,
              published: true,
            },
          });
          seeded++;
        } else if (existing.body !== a.body || existing.title !== a.title) {
          /* مقاله در کد به‌روز شده (بازنویسی) — نسخه کد authoritative است */
          await db.blogPost.update({
            where: { slug: a.slug },
            data: {
              title: a.title,
              excerpt: a.excerpt,
              body: a.body,
              cover: a.cover,
              date: a.date,
              published: true,
            },
          });
          seeded++;
        }
      } catch (e) {
        console.error(`[seed] مقاله ${a.slug}:`, (e as Error).message);
      }
    }
    if (seeded) console.log(`[seed] ${seeded} مقاله در دیتابیس sync شد`);

    /* پاکسازی مقالات جامانده — دیپلوی‌های اول ۱۶ مقاله قدیمی
       (اسلاگ‌هایی مثل orthognathic-surgery با تاریخ ۱۴۰۱) در
       دیتابیس سرور گذاشته بودند. اگر این ردیف‌ها بمانند:
       ۱) پنل ادمین مقالات غیرواقعی نشان می‌دهد
       ۲) اگر دیتابیس یک روز در دسترس شود، سایت ناگهان ۱۶ مقاله
          قدیمی/حذف‌شده را نمایش می‌دهد و سایت‌مپ URLهای ۴۰۴ می‌گیرد
       منبع حقیقت = BLOG_ARTICLES در کد */
    const canonicalSlugs = BLOG_ARTICLES.map((a) => a.slug);
    try {
      const removed = await db.blogPost.deleteMany({
        where: { slug: { notIn: canonicalSlugs } },
      });
      if (removed.count) {
        console.log(`[seed] ${removed.count} مقاله قدیمی از دیتابیس حذف شد`);
        /* بدون حذف قدیمی‌ها، findMany ردیف‌های قدیمی را هم برمی‌گرداند */
      }
    } catch (e) {
      console.error("[seed] cleanup:", (e as Error).message);
    }

    /* زمان‌بند ایجنت‌ها */
    const { startBlogScheduler } = await import("@/lib/agents/scheduler");
    startBlogScheduler();
  } catch (e) {
    /* دیتابیس در دسترس نیست — سایت با fallback بالا می‌آید */
    console.error("[instrumentation] seed/scheduler:", (e as Error).message);
  }
}
