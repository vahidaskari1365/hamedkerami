#!/usr/bin/env node
/* ============================================================
   موج ۲ فیکس کیورد — ۱۰ مقاله مردود باقی‌مانده (علامت→علائم،
   سوالات→مشاوره، هزینه-first، نامتقارنی-first + بدنه‌ها)
   منبع بدنه: llms-full.txt زنده (verbatim دیتابیس) → ویرایش هدفمند
   (جایگزینی پاسخ مستقیم + درج پاراگراف بعد از تیتر لنگر) → publish.
   اسپک: content-fixes/wave2.json
   گیت‌ها: فراوانی کیورد ≥۲، کیورد در پاسخ مستقیم، طول متا ۱۱۰-۱۶۰،
   کلیدواژه ابتدای تایتل (بودجه ۴۶)، ≥۱۵۰۰ کلمه، بدون لینک مطلق جدید.
   اجرا:  محلی (درای‌ران):  node scripts/wave2-publish.mjs --dry
          در Actions:       node scripts/wave2-publish.mjs  (AGENT_SECRET)
   ============================================================ */

import { readFileSync } from "node:fs";

const SITE = (process.env.SITE_URL || "https://dr-kermani.com").replace(/\/$/, "");
const DRY = process.argv.includes("--dry");
const KEY = process.env.AGENT_SECRET || "";

function norm(s) {
  return s.replace(/[\u064B-\u0652\u0670]/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک")
    .replace(/\u200c/g, " ").replace(/\s+/g, " ").toLowerCase();
}
const wordCount = (b) => b.replace(/[#>*`|]/g, " ").split(/\s+/).filter(Boolean).length;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---- کیوردها از seo-keywords.ts ---- */
function parseKeywordMaps(ts) {
  const maps = {};
  for (const name of ["ARTICLE_KEYWORDS", "POOL_ARTICLE_KEYWORDS"]) {
    const block = ts.match(new RegExp(`export const ${name}[^=]*= \\{([\\s\\S]*?)\\n\\};`));
    if (!block) { maps[name] = {}; continue; }
    const entries = {};
    const re = /"([a-z0-9-]+)":\s*\[([\s\S]*?)\]\s*\.join\(", "\)/g;
    let m;
    while ((m = re.exec(block[1]))) {
      const kws = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
      if (kws.length) entries[m[1]] = kws;
    }
    maps[name] = entries;
  }
  return maps;
}
const { ARTICLE_KEYWORDS, POOL_ARTICLE_KEYWORDS } = parseKeywordMaps(readFileSync("src/lib/seo-keywords.ts", "utf-8"));
const kwFor = (slug) => ARTICLE_KEYWORDS[slug] || POOL_ARTICLE_KEYWORDS[slug] || [];

/* ---- بدنه زنده ---- */
async function fetchRetry(url, tries = 4) {
  for (let t = 1; t <= tries; t++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (t === tries) throw e;
      await sleep(2500 * t);
    }
  }
}
function parseLlmsBodies(text) {
  const lines = text.split("\n");
  const out = {};
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ") && lines[i + 1] && lines[i + 1].startsWith("آدرس:")) {
      if (cur) out[cur.slug] = cur.body.join("\n").trim();
      cur = { slug: (lines[i + 1].match(/blog\/([^\/\s]+)$/) || [])[1] || "", body: [], started: false };
      i++; continue;
    }
    if (!cur) continue;
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

let llmsText;
if (DRY) {
  llmsText = readFileSync("audit/llms-live-now.txt", "utf-8");
} else {
  llmsText = await fetchRetry(`${SITE}/llms-full.txt`);
}
const bodies = parseLlmsBodies(llmsText);
console.log(`بدنه زنده: ${Object.keys(bodies).length} مقاله${DRY ? " (درای‌ران محلی)" : ""}`);

const spec = JSON.parse(readFileSync("content-fixes/wave2.json", "utf-8"));
const results = [];

for (const [slug, s] of Object.entries(spec)) {
  if (slug.startsWith("_")) continue;
  const r = { slug, errors: [], notes: [], applied: { body: false, title: false, meta: false } };
  try {
    const kws = kwFor(slug);
    const focus = kws[0] || "";
    if (!focus) throw new Error("کیورد کانونی در seo-keywords نیست");

    let body = bodies[slug];
    if (!body || body.length < 500) throw new Error("بدنه از llms استخراج نشد");
    const origBody = body;
    const nOrig = norm(origBody);

    /* --- ۱) جایگزینی پاسخ مستقیم (اولین خط >) --- */
    const lines = body.split("\n");
    const di = lines.findIndex((l) => l.startsWith("> "));
    if (di < 0) throw new Error("پاسخ مستقیم (> block) پیدا نشد");
    const curDirect = lines[di];
    if (norm(curDirect) === norm("> " + s.newDirect)) {
      r.notes.push("پاسخ مستقیم از قبل اعمال شده (idempotent)");
    } else {
      lines[di] = "> " + s.newDirect;
      r.applied.body = true;
    }
    body = lines.join("\n");

    /* --- ۲) درج پاراگراف‌ها بعد از تیتر لنگر --- */
    for (const ins of s.insertions || []) {
      const nIns = norm(ins.text);
      if (nOrig.includes(nIns)) { r.notes.push("درج از قبل موجود — رد شد"); continue; }
      const lines2 = body.split("\n");
      const hi = lines2.findIndex((l) => l.startsWith("## ") && norm(l.slice(3)) === norm(ins.afterHeading));
      if (hi < 0) throw new Error(`تیتر لنگر پیدا نشد: ${ins.afterHeading}`);
      lines2.splice(hi + 1, 0, "", ins.text);
      body = lines2.join("\n");
      r.applied.body = true;
    }

    /* --- گیت‌های بدنه --- */
    const nBody = norm(body);
    const freq = (nBody.match(new RegExp(esc(norm(focus)), "g")) || []).length;
    const direct = norm((body.match(/^> (.+)$/m) || [])[1] || "");
    if (r.applied.body) {
      if (freq < 2) r.errors.push(`فراوانی کیورد ${freq} < ۲`);
      if (s.newDirect && !direct.includes(norm(focus))) r.errors.push("کیورد در پاسخ مستقیم نیست");
      if (wordCount(body) < 1500) r.errors.push(`کلمات ${wordCount(body)} < ۱۵۰۰`);
      const addedHttp = (body.match(/https?:\/\//g) || []).length - (origBody.match(/https?:\/\//g) || []).length;
      if (addedHttp > 0) r.errors.push("لینک مطلق جدید اضافه شد");
      if (norm(body).length - nOrig.length > 1600) r.errors.push("افزایش طول بیش از حد مجاز");
    }

    /* --- ۳) تایتل و متا --- */
    let title = "", excerpt = "", cover = "";
    if (!DRY) {
      const html = await fetchRetry(`${SITE}/blog/${slug}`);
      const og = (p) => (html.match(new RegExp(`<meta property="og:${p}" content="([^"]*)"`, "u")) || [])[1] || "";
      title = og("title");
      excerpt = og("description");
      cover = og("image").replace(SITE, "") || undefined;
      if (!title || !excerpt) throw new Error("og تگ‌های صفحه زنده ناقص است");
    }
    if (s.title) {
      if (s.title.length < 12 || s.title.length > 70) r.errors.push(`طول تایتل ${s.title.length}`);
      if (!norm(s.title).startsWith(norm(focus))) r.errors.push("کلیدواژه ابتدای تایتل نیست");
      if (norm(s.title).slice(0, 46).includes(norm(focus)) === false) r.errors.push("کلیدواژه خارج بودجه ۴۶");
      title = s.title;
      r.applied.title = true;
    }
    if (s.meta) {
      if (s.meta.length < 110 || s.meta.length > 160) r.errors.push(`طول متا ${s.meta.length} (باید ۱۱۰-۱۶۰)`);
      if (!norm(s.meta).includes(norm(focus))) r.errors.push("کلیدواژه در متا نیست");
      excerpt = s.meta;
      r.applied.meta = true;
    }

    if (r.errors.length) {
      results.push(r);
      console.log(`✗ ${slug} — ${r.errors.join(" ، ")}`);
      continue;
    }

    if (DRY) {
      console.log(`✓ ${slug} [درای‌ران] فراوانی: ${freq} | کلمات: ${wordCount(body)} | تایتل: ${r.applied.title ? "تغییر" : "ثابت"} | متا: ${r.applied.meta ? "تغییر" : "ثابت"}`);
      results.push(r);
      continue;
    }

    /* --- ۴) انتشار --- */
    const res = await fetch(`${SITE}/api/agents/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-agent-key": KEY },
      body: JSON.stringify({ slug, title, excerpt, body, cover, keyword: focus }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok !== false) {
      console.log(`✓ ${slug} منتشر شد — فراوانی ${freq}، ${wordCount(body)} کلمه`);
    } else {
      r.errors.push(`انتشار: HTTP ${res.status} ${j.reason || j.error || ""}`);
      console.log(`✗ ${slug} — ${r.errors[r.errors.length - 1]}`);
    }
    results.push(r);
  } catch (e) {
    r.errors.push(String(e.message || e));
    results.push(r);
    console.log(`✗ ${slug} — ${r.errors.join(" ، ")}`);
  }
  await sleep(1200);
}

const bad = results.filter((r) => r.errors.length);
console.log(`\nنتیجه: ${results.length - bad.length}/${results.length} سالم${DRY ? " (درای‌ران — چیزی منتشر نشد)" : ""}`);
if (bad.length) process.exit(2);
