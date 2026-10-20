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

    /* خودترمیمی جدول BlogPost — دیتابیس سرور از دیپلوی‌های اول مانده و
       ممکن است جدول BlogPost نداشته باشد یا ستون‌هایش با مدل فعلی نخواند؛
       در آن صورت هر کوئری Prisma خطا می‌دهد و سایت برای همیشه روی
       fallback ثابت می‌ماند (datePublished/sitemap بدون تاریخ واقعی).
       چون منبع حقیقت مقالات = کد، بازسازی جدول بی‌خطر است. */
    try {
      const EXPECTED =
        "body,cover,createdAt,date,excerpt,id,published,slug,title,updatedAt";
      const info = (await db.$queryRawUnsafe(
        "PRAGMA table_info(BlogPost)",
      )) as Array<{ name: string }>;
      const names = Array.isArray(info)
        ? info.map((c) => c.name).sort().join(",")
        : "";
      if (names !== EXPECTED) {
        await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "BlogPost"`);
        await db.$executeRawUnsafe(`CREATE TABLE "BlogPost" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "slug" TEXT NOT NULL UNIQUE,
            "title" TEXT NOT NULL,
            "excerpt" TEXT NOT NULL DEFAULT '',
            "body" TEXT NOT NULL DEFAULT '',
            "cover" TEXT NOT NULL DEFAULT '',
            "date" TEXT NOT NULL DEFAULT '',
            "published" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL
        )`);
        console.log("[seed] جدول BlogPost بازسازی شد (ناسازگاری اسکیما)");
      }
    } catch (e) {
      console.error("[seed] self-heal BlogPost:", (e as Error).message);
    }

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
