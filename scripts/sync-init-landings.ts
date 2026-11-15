/* ============================================================
   سید ردیف‌های LandingPage با محتوای جدید LANDING_DEFAULTS (منبع حقیقت)
   → db/init.db (با پکیج دیپلوی می‌رود؛ سرور در بوت‌استرپ یک‌بار
     ردیف‌های custom.db پروداکشن را از آن همگام می‌کند) + db/custom.db
   اجرا: bun scripts/sync-init-landings.ts <slug ...>
   فهرست اسلاگ‌ها باید با db/landing-sync.json یکی باشد.
   ============================================================ */
import { PrismaClient } from "@prisma/client";
import { LANDING_DEFAULTS } from "../src/lib/landing-defaults";
import { readFileSync, writeFileSync } from "node:fs";

const SLUGS = process.argv.slice(2);
if (!SLUGS.length) {
  console.error("اسلاگ‌ها را بدهید: bun scripts/sync-init-landings.ts jaw-surgery chin-surgery ...");
  process.exit(1);
}

const ROOT = process.cwd();
const FIELDS = [
  "slug", "label", "metaTitle", "metaDescription", "keywords", "eyebrow",
  "h1", "heroDesc", "heroImage", "heroImageAlt", "sections", "ctaTitle",
  "ctaDesc", "faqs", "related",
] as const;

function rowFor(slug: string) {
  const d = (LANDING_DEFAULTS as Record<string, any>)[slug];
  if (!d) throw new Error("slug در LANDING_DEFAULTS نیست: " + slug);
  const row: Record<string, unknown> = {};
  for (const f of FIELDS) {
    const v = (d as Record<string, unknown>)[f];
    /* فیلدهای آرایه‌ای در دیتابیس رشتهٔ JSON اند */
    row[f] = Array.isArray(v) ? JSON.stringify(v) : (v ?? "");
  }
  row.published = true;
  return row;
}

for (const dbFile of ["db/init.db", "db/custom.db"]) {
  const p = new PrismaClient({ datasources: { db: { url: `file:${ROOT}/${dbFile}` } } });
  for (const slug of SLUGS) {
    await p.landingPage.upsert({ where: { slug }, create: rowFor(slug) as any, update: rowFor(slug) as any });
    console.log(`${dbFile}: ${slug} synced`);
  }
  await p.$disconnect();
}

/* فگ سرور — همین اسلاگ‌ها در بوت‌استرپ دیپلوی بعدی از init.db به custom.db
   پروداکشن کپی و بعد پاک می‌شوند (server.js → syncLandingRows) */
writeFileSync("db/landing-sync.json", JSON.stringify(SLUGS, null, 2) + "\n", "utf-8");
console.log("db/landing-sync.json نوشته شد:", SLUGS.join(", "));
