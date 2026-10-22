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
    const { jalaliDisplayToIso } = await import("@/lib/jalali");

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

    /* خودترمیمی جدول‌های نوبت‌دهی و نظرات — سرور از دیپلوی‌های قبل
       دیتابیس کهنه دارد که این جدول‌ها را ندارد؛ بدون ساخت خودکار،
       هر POST نوبت/نظر خطا می‌دهد. CREATE IF NOT EXISTS بی‌خطر است. */
    try {
      await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Appointment" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "doctor" TEXT NOT NULL,
          "dayIso" TEXT NOT NULL,
          "dayJalali" TEXT NOT NULL,
          "slot" TEXT NOT NULL DEFAULT '',
          "note" TEXT NOT NULL DEFAULT '',
          "status" TEXT NOT NULL DEFAULT 'pending',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "ArticleComment" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "slug" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "body" TEXT NOT NULL,
          "approved" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      await db.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "Appointment_dayIso_idx" ON "Appointment"("dayIso")`,
      );
      await db.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "Appointment"("status")`,
      );
      await db.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "ArticleComment_slug_idx" ON "ArticleComment"("slug")`,
      );
      await db.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "ArticleComment_approved_idx" ON "ArticleComment"("approved")`,
      );
    } catch (e) {
      console.error("[seed] self-heal Appointment/ArticleComment:", (e as Error).message);
    }

    /* seed/upsert مقالات شاخه ثابت — فقط اگر محتوایشان عوض شده باشد */
    let seeded = 0;
    for (const a of BLOG_ARTICLES) {
      try {
        const existing = await db.blogPost.findUnique({ where: { slug: a.slug } });
        if (!existing) {
          /* تاریخ ساخت ردیف = تاریخ تحریری مقاله (شمسی → میلادی)
             تا datePublished اسکیما و lastmod سایت‌مپ با تاریخ نمایشی
             مقاله یکی باشد، نه لحظه‌ی insert */
          const iso = jalaliDisplayToIso(a.date);
          await db.blogPost.create({
            data: {
              slug: a.slug,
              title: a.title,
              excerpt: a.excerpt,
              body: a.body,
              cover: a.cover,
              date: a.date,
              published: true,
              ...(iso ? { createdAt: new Date(`${iso}T09:00:00.000Z`) } : {}),
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

    /* پایش مقالات خارج از فهرست کد — فقط لاگ، بدون حذف!
       قبلاً اینجا deleteMany({ slug: { notIn: canonicalSlugs } }) بود که
       هر مقاله‌ای که در کد نبود را با هر ری‌استارت/دیپلوی حذف می‌کرد —
       یعنی مقاله‌های منتشرشدهٔ روزانهٔ ایجنت‌ها و مقاله‌های ساخته‌شده در
       پنل ادمین عملاً هر شب پاک می‌شدند و سایت‌مپ هیچ‌وقت مقاله جدید
       نمی‌دید. پاکسازی یک‌بارهٔ مقالات قدیمی (۱۴۰۱) سرور قبلاً انجام
       شده؛ از این پس هیچ حذف خودکاری انجام نمی‌شود — فقط گزارش می‌دهیم. */
    try {
      const canonicalSlugs = BLOG_ARTICLES.map((a) => a.slug);
      const stray = await db.blogPost.findMany({
        where: { slug: { notIn: canonicalSlugs } },
        select: { slug: true },
      });
      if (stray.length) {
        console.log(
          `[seed] ${stray.length} مقاله خارج از فهرست کد (ایجنت/ادمین) — حفظ شد: ${stray
            .map((s) => s.slug)
            .join(", ")}`,
        );
      }
    } catch (e) {
      console.error("[seed] scan:", (e as Error).message);
    }

    /* زمان‌بند ایجنت‌ها */
    const { startBlogScheduler } = await import("@/lib/agents/scheduler");
    startBlogScheduler();
  } catch (e) {
    /* دیتابیس در دسترس نیست — سایت با fallback بالا می‌آید */
    console.error("[instrumentation] seed/scheduler:", (e as Error).message);
  }
}
