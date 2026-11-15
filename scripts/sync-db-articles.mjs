#!/usr/bin/env node
/* ============================================================
   همگام‌سازی رکوردهای مقاله در دیتابیس‌های لوکال با منبع حقیقت مخزن
   (content-fixes/keyword-boost.json + فایل‌های md) — db/custom.db و
   db/init.db تا نسخهٔ لوکال و seed دیپلوی تازه یک‌سان با سایت زنده شود.
   اجرا: node scripts/sync-db-articles.mjs
   ============================================================ */
import { readFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const manifest = JSON.parse(readFileSync("content-fixes/keyword-boost.json", "utf-8"));
const ROOT = process.cwd();

const CHILD = `
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const d = JSON.parse(process.env.PAYLOAD);
await p.blogPost.upsert({
  where: { slug: d.slug },
  create: { slug: d.slug, title: d.title, excerpt: d.excerpt, body: d.body, cover: "/images/blog/3d-" + d.slug + ".jpg", date: "", published: true },
  update: { title: d.title, excerpt: d.excerpt, body: d.body, published: true },
});
console.log("synced " + d.slug);
await p.$disconnect();
`;

for (const [slug, entry] of Object.entries(manifest)) {
  const body = readFileSync(path.resolve(ROOT, entry.bodyFile), "utf-8").trim();
  const payload = JSON.stringify({ slug, title: entry.title, excerpt: entry.excerpt, body });
  for (const dbFile of ["db/custom.db", "db/init.db"]) {
    const out = execFileSync(process.execPath, ["--input-type=module", "-e", CHILD], {
      env: { ...process.env, DATABASE_URL: `file:${ROOT}/${dbFile}`, PAYLOAD: payload },
      encoding: "utf-8",
    });
    console.log(`${dbFile}: ${out.trim().split("\n").pop()}`);
  }
}
console.log("همگام‌سازی دیتابیس کامل شد");
