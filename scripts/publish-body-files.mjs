#!/usr/bin/env node
/* ============================================================
   انتشار بدنه‌های غنی‌شده — content-fixes/<slug>.md → /api/agents/publish
   در GitHub Actions با AGENT_SECRET اجرا می‌شود (همان مسیر ایجنت روزانه).
   متا (title/excerpt/cover) از og تگ صفحه زنده خوانده می‌شود — بدون تغییر.
   اجرا: AGENT_SECRET=... node scripts/publish-body-files.mjs
   ============================================================ */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SITE = (process.env.SITE_URL || "https://dr-kermani.com").replace(/\/$/, "");
const DIR = "content-fixes";
const AGENT_KEY = process.env.AGENT_SECRET || "";

if (!AGENT_KEY) {
  console.error("AGENT_SECRET تنظیم نشده است");
  process.exit(1);
}

function slugFrom(file) {
  return file.replace(/\.md$/, "");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchMeta(slug) {
  const html = await (await fetch(`${SITE}/blog/${slug}`)).text();
  const og = (p) => (html.match(new RegExp(`<meta property="og:${p}" content="([^"]*)"`, "u")) || [])[1] || "";
  const title = og("title");
  const excerpt = og("description");
  const cover = og("image").replace(SITE, "") || undefined;
  if (!title || !excerpt) throw new Error("متای og ناقص است");
  return { title, excerpt, cover };
}

(async () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".md")).sort();
  if (!files.length) {
    console.log(`فایلی در ${DIR}/ نیست — کاری انجام نشد`);
    process.exit(0);
  }
  console.log(`تعداد فایل برای انتشار: ${files.length}`);

  const results = [];
  for (const f of files) {
    const slug = slugFrom(f);
    const body = readFileSync(path.join(DIR, f), "utf-8").trim();
    try {
      const meta = await fetchMeta(slug);
      const keyword = meta.title.split(/[؛|]/)[0].trim().slice(0, 60);
      const res = await fetch(`${SITE}/api/agents/publish`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-agent-key": AGENT_KEY },
        body: JSON.stringify({ slug, title: meta.title, excerpt: meta.excerpt, body, keyword, cover: meta.cover }),
      });
      const out = await res.json().catch(() => ({}));
      results.push({ slug, ok: res.ok && out.ok !== false, status: res.status, reason: out.reason || out.error || "" });
      console.log(`${res.ok && out.ok !== false ? "✔" : "✗"} ${slug} — HTTP ${res.status} ${out.reason || out.error || ""}`.trimEnd());
    } catch (e) {
      results.push({ slug, ok: false, status: 0, reason: e.message });
      console.log(`✗ ${slug} — ${e.message}`);
    }
    await sleep(800);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\nنتیجه: ${results.length - failed.length}/${results.length} منتشر شد`);
  if (failed.length) {
    console.log("ناموفق‌ها:", failed.map((f) => `${f.slug}(${f.reason.slice(0, 120)})`).join(" | "));
    process.exit(1);
  }
})().catch((e) => {
  console.error("خطا:", e.message);
  process.exit(1);
});
