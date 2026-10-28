#!/usr/bin/env node
/* ============================================================
   فیکس متا دیسکریپشن مقاله‌های زنده — content-fixes/meta-manifest.json
   { "slug": "چکیده جدید ۱۱۰-۱۶۰ کاراکتری", ... }
   → بدنه از llms-full.txt (دیتابیس زنده، verbatim) خوانده می‌شود و
     دست‌نخورده برمی‌گردد؛ فقط excerpt جایگزین می‌شود (گیت‌های سردبیر
     روی بدنه تغییری نمی‌کنند). عنوان و کاور از og صفحه زنده می‌آید.
   اجرا در Actions: AGENT_SECRET=... node scripts/fix-meta-publish.mjs
   ============================================================ */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const SITE = (process.env.SITE_URL || "https://dr-kermani.com").replace(/\/$/, "");
const MANIFEST = "content-fixes/meta-manifest.json";
const KEY = process.env.AGENT_SECRET || "";

if (!KEY) { console.error("AGENT_SECRET تنظیم نشده است"); process.exit(1); }
if (!existsSync(MANIFEST)) { console.error(`${MANIFEST} نیست`); process.exit(1); }

const manifest = JSON.parse(readFileSync(MANIFEST, "utf-8"));
const entries = Object.entries(manifest);
console.log(`تعداد متا برای به‌روزرسانی: ${entries.length}`);

/* ---- استخراج بدنه مقاله‌ها از llms-full.txt (بدنه = verbatim دیتابیس) ---- */
function parseLlmsBodies(text) {
  const lines = text.split("\n");
  const out = {};
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ") && lines[i + 1] && lines[i + 1].startsWith("آدرس:")) {
      if (cur) out[cur.slug] = cur.body.join("\n").trim();
      cur = { slug: (lines[i + 1].match(/blog\/([^\/\s]+)$/) || [])[1] || "", body: [], started: false };
      i++; /* پرش از خط آدرس */
      continue;
    }
    if (!cur) continue;
    /* بدنه از اولین خط غیرخالی بعد از خط تاریخ شروع می‌شود (پاسخ مستقیم >) */
    if (!cur.started) {
      if (line.startsWith("تاریخ:")) { cur.pending = true; continue; }
      if (cur.pending && line.trim() === "") continue;
      if (cur.pending) cur.started = true;
      else continue;
    }
    cur.body.push(line);
  }
  if (cur) out[cur.slug] = cur.body.join("\n").trim();
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchRetry(url, tries = 4) {
  for (let t = 1; t <= tries; t++) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 30000);
      const res = await fetch(url, { signal: ctl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (t === tries) throw e;
      await sleep(2000 * t);
    }
  }
}

const llmsText = await fetchRetry(`${SITE}/llms-full.txt`);
const bodies = parseLlmsBodies(llmsText);
console.log(`llms-full.txt: ${Object.keys(bodies).length} مقاله خوانده شد`);

const results = [];
for (const [slug, excerpt] of entries) {
  const ex = String(excerpt).trim();
  try {
    if (ex.length < 110 || ex.length > 160) throw new Error(`طول چکیده نامعتبر: ${ex.length} (باید ۱۱۰-۱۶۰ باشد)`);
    const body = bodies[slug];
    if (!body || body.length < 500) throw new Error("بدنه مقاله از llms استخراج نشد");

    /* عنوان و کاور از متای صفحه زنده — بدون تغییر */
    const html = await fetchRetry(`${SITE}/blog/${slug}`);
    const og = (p) => (html.match(new RegExp(`<meta property="og:${p}" content="([^"]*)"`, "u")) || [])[1] || "";
    const title = og("title");
    const cover = og("image").replace(SITE, "") || undefined;
    if (!title) throw new Error("og:title خوانده نشد");

    const res = await fetch(`${SITE}/api/agents/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-agent-key": KEY },
      body: JSON.stringify({ slug, title, excerpt: ex, body, cover }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok) {
      console.log(`✓ ${slug} — متا به‌روز شد (${ex.length} کاراکتر)`);
      results.push({ slug, ok: true });
    } else {
      console.error(`✗ ${slug} — ${res.status} ${j.reason || j.error || ""}`);
      results.push({ slug, ok: false, reason: j.reason || j.error });
    }
  } catch (e) {
    console.error(`✗ ${slug} — ${(e && e.message) || e}`);
    results.push({ slug, ok: false, reason: String(e && e.message) });
  }
  await sleep(1200);
}

const failed = results.filter((r) => !r.ok);
console.log(`\nنتیجه: ${results.length - failed.length}/${results.length} موفق`);
if (failed.length) process.exit(2);
