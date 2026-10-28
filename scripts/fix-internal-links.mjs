#!/usr/bin/env node
/* ============================================================
   لینک‌سازی داخلی هدفمند — content-fixes/internal-link-plan.json
   برای هر جفت {source, orphan, anchor}: یک جمله با لینک دارای
   انکرتکست کلیدواژه به پایان پاراگراف مرتبطِ مقاله مبدأ اضافه
   می‌شود (پاراگراف زیر نزدیک‌ترین تیترِ هم‌موضوع انتخاب می‌شود).
   هدف: ۱۹ مقالهٔ بدون هیچ لینک ورودی از مقالات دیگر پوشش داده شوند.
   بدنه از llms-full.txt (دیتابیس زنده) خوانده و verbatim + جمله جدید
   منتشر می‌شود؛ title/excerpt/cover از متای صفحه زنده برمی‌گردد.
   DRY=1 node scripts/fix-internal-links.mjs  → فقط شبیه‌سازی محلی
   (کش audit/llms-live.txt)، بدون انتشار — برای QA قبل از Actions.
   اجرا در Actions: AGENT_SECRET=... node scripts/fix-internal-links.mjs
   ============================================================ */

import { readFileSync, existsSync } from "node:fs";

const SITE = (process.env.SITE_URL || "https://dr-kermani.com").replace(/\/$/, "");
const PLAN = "content-fixes/internal-link-plan.json";
const KEY = process.env.AGENT_SECRET || "";
const DRY = process.env.DRY === "1";

if (!DRY && !KEY) { console.error("AGENT_SECRET تنظیم نشده است"); process.exit(1); }
if (!existsSync(PLAN)) { console.error(`${PLAN} نیست`); process.exit(1); }

const plan = JSON.parse(readFileSync(PLAN, "utf-8"));
const pairs = plan.pairs;
console.log(`جفت‌های لینک: ${pairs.length} | حالت: ${DRY ? "DRY (بدون انتشار)" : "انتشار زنده"}`);

/* ---- ابزارها ---- */
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

function parseLlmsBodies(text) {
  const lines = text.split("\n");
  const out = {};
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ") && lines[i + 1] && lines[i + 1].startsWith("آدرس:")) {
      if (cur) out[cur.slug] = cur.body.join("\n").trim();
      cur = { slug: (lines[i + 1].match(/blog\/([^\/\s]+)$/) || [])[1] || "", body: [] };
      i++; /* پرش از خط آدرس */
      continue;
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

/* ---- انتخاب پاراگراف هدف ---- */
const STOP = new Set(["از","به","با","برای","در","که","و","یا","تا","هم","می","را","است","شده","پس","اگر","این","آن","هر","بین","روی","بعد","قبل","بدون","چیست","چگونه","چقدر","چند","کی","کجا","چرا","چه","بود","شو","های","های"]);
const toks = (s) => s.replace(/[،؛:|«»()؟?._\-\/]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const isNoiseLine = (l) =>
  /^#{1,6}\s/.test(l) || /^>/.test(l) || /^\|/.test(l) || /^[-*]\s/.test(l) ||
  /^\d+[.)]\s/.test(l) || /^!?\[/.test(l) || /^</.test(l) || !l.trim();
const isFaqHeading = (l) => /سؤال|سوال|متداول|پرسش|faq|منابع|مرتبط/i.test(l);

function pickPlacement(bodyText, orphanTitle, anchor, used = []) {
  const overlaps = (p) => used.some((u) => p.start >= u.start && p.start <= u.end);
  const lines = bodyText.split("\n");
  const want = new Set([...toks(orphanTitle), ...toks(anchor)]);
  /* تیترهای قبل از FAQ + امتیاز بر اساس طول توکن‌های مشترک */
  let bestHead = null, bestScore = 0, bestHeadIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,6}\s/.test(l)) {
      if (isFaqHeading(l)) break;
      const score = toks(l).reduce((a, t) => a + (want.has(t) ? t.length : 0), 0);
      if (score > bestScore) { bestScore = score; bestHead = l.trim(); bestHeadIdx = i; }
    }
  }
  /* پاراگراف‌های مجاز (قبل از FAQ) */
  const paras = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,6}\s/.test(l) && isFaqHeading(l)) break;
    if (isNoiseLine(l)) continue;
    let j = i;
    while (j + 1 < lines.length && !isNoiseLine(lines[j + 1]) && !/^#{1,6}\s/.test(lines[j + 1])) j++;
    const block = lines.slice(i, j + 1);
    if (block.join(" ").length >= 60) paras.push({ start: i, end: j });
    i = j;
  }
  const free = paras.filter((p) => !overlaps(p));
  if (!free.length) return null;
  let target = null;
  if (bestHeadIdx >= 0) {
    target = free.find((p) => p.start > bestHeadIdx) || null; /* اولین پاراگراف آزاد بعد از تیتر برتر */
  }
  if (!target) target = free[Math.floor((free.length - 1) * 0.3)]; /* عمق ~۳۰٪ */
  return { heading: bestHead || "(بدون تطبیق تیتر — جای عمق ۳۰٪)", start: target.start, end: target.end };
}

const TPL = [
  (a, u) => `راهنمای کامل [${a}](${u}) نیز می‌تواند راهگشا باشد.`,
  (a, u) => `جزئیات بیشتر در راهنمای [${a}](${u}) آمده است.`,
  (a, u) => `پیشنهاد می‌کنیم راهنمای [${a}](${u}) را هم بخوانید.`,
];

/* ---- بارگیری بدنه‌ها ---- */
const llmsText = DRY
  ? readFileSync("audit/llms-live.txt", "utf-8")
  : await fetchRetry(`${SITE}/llms-full.txt`);
const bodies = parseLlmsBodies(llmsText);
console.log(`llms: ${Object.keys(bodies).length} مقاله خوانده شد`);

/* گروه‌بندی جفت‌ها بر اساس مقاله مبدأ */
const bySource = new Map();
for (const p of pairs) {
  if (!bySource.has(p.source)) bySource.set(p.source, []);
  bySource.get(p.source).push(p);
}

const results = [];
const changed = new Map(); /* source → newBody */
for (const [source, list] of bySource) {
  const orig = bodies[source];
  if (!orig || orig.length < 500) {
    list.forEach((p) => results.push({ ...p, ok: false, note: "بدنه مبدأ یافت نشد" }));
    continue;
  }
  let body = orig;
  const usedRanges = [];
  for (const p of list) {
    const url = `${SITE}/blog/${p.orphan}`;
    if (body.includes(`/blog/${p.orphan})`)) {
      results.push({ ...p, ok: true, note: "قبلاً لینک دارد — رد شد (idempotent)" });
      continue;
    }
    const place = pickPlacement(body, p.orphan, p.anchor, usedRanges);
    if (!place) {
      results.push({ ...p, ok: false, note: "پاراگراف مناسب یافت نشد" });
      continue;
    }
    usedRanges.push({ start: place.start, end: place.end });
    const sentence = TPL[results.length % TPL.length](p.anchor, url);
    const lines = body.split("\n");
    lines[place.end] = `${lines[place.end]} ${sentence}`;
    body = lines.join("\n");
    results.push({ ...p, ok: true, note: `${place.heading} @L${place.start}`, sentence });
  }
  if (body !== orig) changed.set(source, body);
}

/* ---- گزارش DRY ---- */
const okN = results.filter((r) => r.ok && !/رد شد/.test(r.note)).length;
const skipped = results.filter((r) => /رد شد/.test(r.note)).length;
const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? (skipped && /رد شد/.test(r.note) ? "↺" : "✓") : "✗"} ${r.source} → ${r.orphan} [${r.anchor}] | ${r.note}${r.ok && r.sentence ? "" : r.ok ? "" : ""}`);
  if (!r.ok) console.error(`   خطا: ${r.note}`);
}
console.log(`\nجمع: ${okN} لینک جدید | ${skipped} از قبل موجود | ${failed.length} ناموفق | ${changed.size} مقاله مبدأ تغییر می‌کند`);
if (failed.length && DRY) process.exit(2);
if (DRY) {
  console.log("\nDRY تمام شد — بدون انتشار. برای اجرای زنده: push + workflow_dispatch");
  process.exit(0);
}

/* ---- انتشار ---- */
const pub = [];
for (const [slug, body] of changed) {
  try {
    const html = await fetchRetry(`${SITE}/blog/${slug}`);
    const og = (p) => (html.match(new RegExp(`<meta property="og:${p}" content="([^"]*)"`, "u")) || [])[1] || "";
    const excerpt = og("description");
    if (!excerpt) throw new Error("og:description خوانده نشد");
    const cover = og("image").replace(SITE, "") || undefined;
    const title = og("title");
    if (!title) throw new Error("og:title خوانده نشد");
    const res = await fetch(`${SITE}/api/agents/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-agent-key": KEY },
      body: JSON.stringify({ slug, title, excerpt, body, cover }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok) { console.log(`✓ منتشر شد: ${slug}`); pub.push({ slug, ok: true }); }
    else { console.error(`✗ ${slug} — ${res.status} ${j.reason || j.error || ""}`); pub.push({ slug, ok: false }); }
  } catch (e) {
    console.error(`✗ ${slug} — ${(e && e.message) || e}`);
    pub.push({ slug, ok: false });
  }
  await sleep(1200);
}

const pubFailed = pub.filter((r) => !r.ok);
console.log(`\nانتشار: ${pub.length - pubFailed.length}/${pub.length} موفق`);
if (pubFailed.length) process.exit(2);
