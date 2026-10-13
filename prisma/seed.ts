/* Seed — انتقال کل محتوای data.ts به دیتابیس (فقط جدول‌های خالی) */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";
import {
  BEFORE_AFTER,
  BLOG_POSTS,
  CERTIFICATES,
  EDUCATION,
  FAQ,
  GALLERY_CASES,
  HERO,
  HOURS,
  IMPLANT_COSTS,
  JAW_COSTS,
  PORTFOLIO_COVERS,
  SERVICE_EXTRAS,
  SERVICES,
  SITE,
  STATS,
  SUCCESS_RATES,
  TEAM,
  VIDEOS,
} from "../src/lib/data";

const db = new PrismaClient();

async function main() {
  console.log("→ seeding…");

  if ((await db.adminUser.count()) === 0) {
    await db.adminUser.create({
      data: { username: "admin", passwordHash: hashPassword("kermani1403") },
    });
    console.log("  ✓ admin user (admin / kermani1403)");
  }

  const setting = async (key: string, value: unknown) => {
    const exists = await db.setting.findUnique({ where: { key } });
    if (!exists) await db.setting.create({ data: { key, value: JSON.stringify(value) } });
  };
  await setting("site", SITE);
  await setting("hero", HERO);
  await setting("about", BIO_DUMMY());
  await setting("videos", VIDEOS);

  if ((await db.service.count()) === 0) {
    for (let i = 0; i < SERVICES.length; i++) {
      const s = SERVICES[i];
      await db.service.create({
        data: {
          slug: s.slug,
          title: s.title,
          latin: s.latin,
          desc: s.desc,
          image: s.image,
          points: JSON.stringify(s.points),
          order: i,
        },
      });
    }
    console.log(`  ✓ ${SERVICES.length} services`);
  }

  if ((await db.serviceExtra.count()) === 0) {
    for (let i = 0; i < SERVICE_EXTRAS.length; i++) {
      await db.serviceExtra.create({
        data: { ...SERVICE_EXTRAS[i], order: i },
      });
    }
  }

  if ((await db.education.count()) === 0) {
    for (let i = 0; i < EDUCATION.length; i++) {
      await db.education.create({ data: { ...EDUCATION[i], order: i } });
    }
  }

  if ((await db.teamMember.count()) === 0) {
    for (let i = 0; i < TEAM.length; i++) {
      await db.teamMember.create({
        data: { name: TEAM[i].name, role: TEAM[i].role, image: TEAM[i].image ?? "", order: i },
      });
    }
  }

  if ((await db.stat.count()) === 0) {
    for (let i = 0; i < STATS.length; i++) {
      await db.stat.create({ data: { ...STATS[i], order: i } });
    }
  }

  if ((await db.successRate.count()) === 0) {
    for (let i = 0; i < SUCCESS_RATES.length; i++) {
      await db.successRate.create({ data: { ...SUCCESS_RATES[i], order: i } });
    }
  }

  if ((await db.costItem.count()) === 0) {
    for (let i = 0; i < JAW_COSTS.length; i++) {
      await db.costItem.create({ data: { ...JAW_COSTS[i], category: "jaw", order: i } });
    }
    for (let i = 0; i < IMPLANT_COSTS.length; i++) {
      await db.costItem.create({ data: { ...IMPLANT_COSTS[i], category: "implant", order: i } });
    }
    console.log(`  ✓ costs`);
  }

  if ((await db.blogPost.count()) === 0) {
    for (const p of BLOG_POSTS) {
      await db.blogPost.create({
        data: {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          body: p.body,
          date: p.date,
        },
      });
    }
    console.log(`  ✓ ${BLOG_POSTS.length} blog posts`);
  }

  if ((await db.galleryCase.count()) === 0) {
    for (let i = 0; i < GALLERY_CASES.length; i++) {
      await db.galleryCase.create({ data: { ...GALLERY_CASES[i], order: i } });
    }
  }

  if ((await db.portfolioCover.count()) === 0) {
    for (let i = 0; i < PORTFOLIO_COVERS.length; i++) {
      await db.portfolioCover.create({ data: { ...PORTFOLIO_COVERS[i], order: i } });
    }
    console.log(`  ✓ ${PORTFOLIO_COVERS.length} portfolio covers`);
  }

  if ((await db.certificate.count()) === 0) {
    for (let i = 0; i < CERTIFICATES.length; i++) {
      await db.certificate.create({ data: { ...CERTIFICATES[i], order: i } });
    }
  }

  if ((await db.faq.count()) === 0) {
    for (let i = 0; i < FAQ.length; i++) {
      await db.faq.create({ data: { ...FAQ[i], order: i } });
    }
  }

  if ((await db.hour.count()) === 0) {
    for (let i = 0; i < HOURS.length; i++) {
      await db.hour.create({ data: { ...HOURS[i], order: i } });
    }
  }

  if ((await db.beforeAfterPair.count()) === 0) {
    for (const key of ["bimax", "blepharo", "main"] as const) {
      await db.beforeAfterPair.create({ data: { key, ...BEFORE_AFTER[key] } });
    }
  }

  console.log("✓ seed done");
}

/* BIO در data.ts یک شیء است */
import { BIO } from "../src/lib/data";
function BIO_DUMMY() {
  return BIO;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
