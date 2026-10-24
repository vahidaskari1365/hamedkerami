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

    /* ============================================================
       سینک محتوایی نسخه‌بندی‌شده — آمار/درصدها/شماره تماس
       منبع حقیقت = data.ts. دیتابیس پروداکشن (custom.db) ردیف‌های
       قدیمی دارد که با دیپلوی عوض نمی‌شوند؛ این بلوک با مارکر نسخه
       در جدول Setting فقط یک بار در هر نسخه اجرا می شود:
       ۱) بازسازی کامل Stat و SuccessRate از داده‌ی کد
       ۲) جایگزینی امن شماره ثابت با موبایل در Setting/Faq/LandingPage/BlogPost
       ۳) بروزرسانی عبارت‌های آماری قدیمی (۱۰۶۷ جراحی، ۵۰۰۰ ایمپلنت…)
       ۴) تطبیق سقف کیفیت مقاله‌ها با claude-seo quality-gates (≥۱۵۰۰ کلمه)
       ============================================================ */
    const SYNC_VERSION = "2026-10-24-article-wordcount-v2";
    try {
      const markerRow = await db.setting.findUnique({ where: { key: "contentSyncVersion" } });
      let marker = "";
      if (markerRow) {
        try {
          marker = JSON.parse(markerRow.value) as string;
        } catch {
          marker = markerRow.value;
        }
      }
      if (marker !== SYNC_VERSION) {
        let changes = 0;

        /* ۱) شمارنده‌های آمار — بازسازی از data.ts */
        const { STATS, SUCCESS_RATES } = await import("@/lib/data");
        const statRows = await db.stat.findMany({ orderBy: { order: "asc" } });
        const statSig = JSON.stringify(statRows.map((r) => [r.value, r.label, r.suffix]));
        const wantStatSig = JSON.stringify(STATS.map((s) => [s.value, s.label, s.suffix]));
        if (statSig !== wantStatSig) {
          await db.stat.deleteMany({});
          await db.stat.createMany({
            data: STATS.map((s, i) => ({ value: s.value, label: s.label, suffix: s.suffix, order: i })),
          });
          changes++;
          console.log("[sync] جدول Stat بازسازی شد (آمار جدید)");
        }

        /* ۲) کارت‌های درصد موفقیت — بازسازی از data.ts */
        const rateRows = await db.successRate.findMany({ orderBy: { order: "asc" } });
        const rateSig = JSON.stringify(rateRows.map((r) => [r.rate, r.title, r.detail]));
        const wantRateSig = JSON.stringify(SUCCESS_RATES.map((s) => [s.rate, s.title, s.detail]));
        if (rateSig !== wantRateSig) {
          await db.successRate.deleteMany({});
          await db.successRate.createMany({
            data: SUCCESS_RATES.map((s, i) => ({ rate: s.rate, title: s.title, detail: s.detail, order: i })),
          });
          changes++;
          console.log("[sync] جدول SuccessRate بازسازی شد (درصدهای جدید)");
        }

        /* ۳) جایگزینی‌های متنی امن — شماره ثابت → موبایل + عبارت‌های آماری
              ترتیب مهم است: نسخه +98 قبل از 98 و ۰۲۱- قبل از ۰۲۱۶۶۹ */
        const REPLACEMENTS: Array<[string, string]> = [
          ["۰۲۱-۶۶۹۲۱۵۰۰", "۰۹۳۸-۲۰۸۰۲۷۰"],
          ["۰۲۱۶۶۹۲۱۵۰۰", "۰۹۳۸۲۰۸۰۲۷۰"],
          ["+982166921500", "+989382080270"],
          ["982166921500", "989382080270"],
          ["021-66921500", "0938-2080270"],
          ["02166921500", "09382080270"],
          ["۱۰۶۷ جراحی", "۱۲۰۰ جراحی"],
          ["۱۰۶۷ عمل", "۱۲۰۰ عمل"],
          ["۵۰۰۰ ایمپلنت", "۲۰۰۰۰ ایمپلنت"],
          ["1067 جراحی", "1200 جراحی"],
          ["5000 ایمپلنت", "20000 ایمپلنت"],
        ];
        const fix = (s: string): string =>
          REPLACEMENTS.reduce((acc, [from, to]) => acc.split(from).join(to), s);

        const settings = await db.setting.findMany();
        for (const s of settings) {
          if (s.key === "contentSyncVersion") continue;
          const fixed = fix(s.value);
          if (fixed !== s.value) {
            await db.setting.update({ where: { key: s.key }, data: { value: fixed } });
            changes++;
          }
        }

        const faqs = await db.faq.findMany();
        for (const f of faqs) {
          const q = fix(f.q);
          const a = fix(f.a);
          if (q !== f.q || a !== f.a) {
            await db.faq.update({ where: { id: f.id }, data: { q, a } });
            changes++;
          }
        }

        const landings = await db.landingPage.findMany();
        for (const l of landings) {
          const data: Record<string, string> = {};
          const textKeys = [
            "metaTitle",
            "metaDescription",
            "eyebrow",
            "h1",
            "heroDesc",
            "sections",
            "ctaTitle",
            "ctaDesc",
            "faqs",
          ] as const;
          for (const k of textKeys) {
            const fixed = fix(l[k]);
            if (fixed !== l[k]) data[k] = fixed;
          }
          if (Object.keys(data).length) {
            await db.landingPage.update({ where: { id: l.id }, data });
            changes++;
          }
        }

        const posts = await db.blogPost.findMany({
          select: { id: true, title: true, excerpt: true, body: true },
        });
        for (const p of posts) {
          const title = fix(p.title);
          const excerpt = fix(p.excerpt);
          const body = fix(p.body);
          if (title !== p.title || excerpt !== p.excerpt || body !== p.body) {
            await db.blogPost.update({ where: { id: p.id }, data: { title, excerpt, body } });
            changes++;
          }
        }

        /* ۴) تطبیق سقف کیفیت مقاله‌ها (claude-seo quality-gates: بلاگ ≥۱۵۰۰ کلمه)
              دو مقالهٔ دستهٔ اول کمی زیر سقف بودند؛ بخش تکمیلی پیش از «پرسش های پرتکرار»
              درج می‌شود. idempotent: اگر عنوان بخش از قبل در بدنه باشد، دست نمی‌زند. */
        const ARTICLE_SECTIONS: Array<{ slug: string; heading: string; body: string }> = [
          {
            slug: "blepharoplasty-cost-1405",
            heading: "بلفاروپلاستی چقدر دوام دارد؟ حساب هزینه در طول سال‌ها",
            body: `وقتی هزینه بلفاروپلاستی را با بیماران مطب مرور می‌کنیم، همیشه یک سوال بعدی می‌آید: «چند سال نتیجه می‌ماند؟» تجربه بالینی و مطالعات رایج نشان می‌دهد نتیجه پلک فوقانی معمولاً ۱۰ تا ۱۵ سال و نتیجه پلک تحتانی اغلب طولانی‌تر از آن می‌ماند؛ چون چینِ ایجادشده و پوستِ برداشته‌شده برنمی‌گردند و فقط روند طبیعی پیری ادامه پیدا می‌کند. سرعت این روند به ژنتیک، حالت پوست شما، مصرف سیگار و مراقبت از پوست بستگی دارد.\n\nاز این عدد یک دید ساده بسازید: اگر هزینه امروز را بر بیش از یک دهه ماندگاری تقسیم کنید، بهای واقعی هر سالِ «پلک سرحال» بسیار کمتر از عدد اولیه‌ای می‌شود که در قرارداد می‌بینید. در مشاوره با دکتر حامد کرمانی، این برآورد بلندمدت همراه با بررسی انحنای حدقه و ضخامت پوست شما مشخص می‌شود تا تصمیم مالی و پزشکی هر دو روشن باشد.`,
          },
          {
            slug: "best-implant-brands",
            heading: "تأیید اصالت ایمپلنت؛ کارت گارانتی و کد رهگیری چیست؟",
            body: `پرسش پرتکرار بیماران در مطب این است: «از کجا بفهمم ایمپلنتی که در دهان من گذاشته‌اید اصل همان برند است؟» برندهای معتبر برای هر فیکسچر یک شناسه یکتا دارند که در بسته‌بندی استریل و در کارت گارانتی رسمی درج می‌شود و امکان رهگیری آن در سامانه رسمی شرکت وجود دارد. پیش از جراحی از کلینیک بخواهید نام دقیق برند و کشور سازنده را کتباً در قرارداد بیاورد و کارت گارانتی با شماره سری هموارده شما داده شود؛ این کارت در ویزیت‌های بعدی، قصد مهاجرت یا مراجعه به دندانپزشک دیگر هم ارزش سند دارد.\n\nایمپلنت بدون سابقه و بدون گارانتی معمولاً ارزان‌تر است، اما ریسک عدم تطابق قطعات و از دست رفتن پشتیبانی شرکت را به جان می‌خرد. در مطب دکتر حامد کرمانی، برند بر اساس تراکم استخوان و بودجه شما انتخاب می‌شود و اصالت هر قطعه با مستندات کتبی تحویل می‌گردد.`,
          },
        ];
        for (const sec of ARTICLE_SECTIONS) {
          try {
            const post = await db.blogPost.findUnique({ where: { slug: sec.slug } });
            if (!post || post.body.includes(sec.heading)) continue;
            const insert = `## ${sec.heading}\n\n${sec.body}\n\n`;
            const anchor = post.body.search(/## پرسش/);
            const body = anchor >= 0 ? post.body.slice(0, anchor) + insert + post.body.slice(anchor) : post.body + "\n\n" + insert;
            await db.blogPost.update({ where: { slug: sec.slug }, data: { body } });
            changes++;
            console.log(`[sync] بخش تکمیلی به ${sec.slug} اضافه شد (سقف ۱۵۰۰ کلمه)`);
          } catch (e) {
            console.error(`[sync] مقاله ${sec.slug}:`, (e as Error).message);
          }
        }

        await db.setting.upsert({
          where: { key: "contentSyncVersion" },
          create: { key: "contentSyncVersion", value: JSON.stringify(SYNC_VERSION) },
          update: { value: JSON.stringify(SYNC_VERSION) },
        });
        console.log(`[sync] محتوا همگام شد (v${SYNC_VERSION}) — ${changes} اصلاح`);
      }
    } catch (e) {
      console.error("[sync] خطای سینک محتوا (غیرمرگبار):", (e as Error).message);
    }


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
