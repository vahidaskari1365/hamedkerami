#!/usr/bin/env node
/* ============================================================
   انتشار زندهٔ مقاله‌های هدف‌گذاری‌شدهٔ کیورد — keyword-boost.json
   [ { slug, title, excerpt, bodyFile } ] → POST /api/agents/publish
   با AGENT_SECRET (همان مسیر ایجنت روزانه + گیت‌های سردبیر).
   تفاوت با publish-body-files: عنوان/چکیده هم از مانیفست ست می‌شود
   (برای مقاله‌هایی که تایتل‌شان برای کیورد جدید بازنویسی شده).
   اجرا در Actions: AGENT_SECRET=... node scripts/keyword-boost-publish.mjs
   ============================================================ */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const SITE = (process.env.SITE_URL || "https://dr-kermani.com").replace(/\/$/, "");
const MANIFEST = "content-fixes/keyword-boost.json";
const KEY = process.env.AGENT_SECRET || "";

if (!KEY) { console.error("AGENT_SECRET تنظیم نشده است"); process.exit(1); }
if (!existsSync(MANIFEST)) { console.error(`${MANIFEST} نیست`); process.exit(1); }

const manifest = JSON.parse(readFileSync(MANIFEST, "utf-8"));
const entries = Object.entries(manifest);
console.log(`تعداد مقاله برای انتشار: ${entries.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
for (const [slug, entry] of entries) {
  try {
    const bodyFile = path.resolve(entry.bodyFile);
    const body = readFileSync(bodyFile, "utf-8").trim();
    const payload = { slug, body, keyword: "" };
    if (entry.title) payload.title = entry.title.trim();
    if (entry.excerpt) payload.excerpt = entry.excerpt.trim();
    /* کاور — از صفحهٔ زنده بخوان تا حذف نشود */
    const html = await (await fetch(`${SITE}/blog/${slug}`)).text();
    const cover = (html.match(/<meta property="og:image" content="([^"]*)"/u) || [])[1];
    if (cover) payload.cover = cover.replace(SITE, "") || undefined;
    if (payload.title && payload.excerpt && !(payload.excerpt.length >= 110 && payload.excerpt.length <= 160)) {
      throw new Error(`طول چکیده نامعتبر: ${payload.excerpt.length} (باید ۱۱۰-۱۶۰ باشد)`);
    }
    const res = await fetch(`${SITE}/api/agents/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-agent-key": KEY },
      body: JSON.stringify(payload),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok !== false) {
      console.log(`✓ ${slug} — منتشر شد${payload.title ? ` (عنوان جدید: ${payload.title.slice(0, 45)}…)` : ""}`);
      results.push({ slug, ok: true });
    } else {
      console.error(`✗ ${slug} — ${res.status} ${j.reason || j.error || ""}`);
      results.push({ slug, ok: false, reason: j.reason || j.error });
    }
  } catch (e) {
    console.error(`✗ ${slug} — ${(e && e.message) || e}`);
    results.push({ slug, ok: false, reason: String(e && e.message) });
  }
  await sleep(1500);
}

const failed = results.filter((r) => !r.ok);
console.log(`\nنتیجه: ${results.length - failed.length}/${results.length} موفق`);
if (failed.length) process.exit(2);
