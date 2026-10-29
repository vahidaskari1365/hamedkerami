#!/usr/bin/env node
/* ============================================================
   ممیزی نهایی رد/قبول ۴۰ مقاله مردود دور اول — نسخه زنده
   منابع:
   - audit/llms-live.txt  (اسنپ‌شات زنده سایت، شامل تایتل‌های فیکس‌شده ۱۸گانه)
   - src/lib/seo-keywords.ts  (ARTICLE_KEYWORDS + POOL_ARTICLE_KEYWORDS)
   - audit/keyword-audit.json   (دور ۱ — لیست ۴۰ مردود + مپینگ کلیدواژه)
   - audit/keyword-audit2.json  (دور ۲ — امتیاز بعد از فیکس + وضعیت meta)
   خروجی:
   - audit/keyword-final-verdict.md  (جدول رد/قبول ۴۰ مقاله)
   - audit/keyword-final-verdict.json
   اجرا: node scripts/keyword-audit-final.mjs
   ============================================================ */

import { readFileSync, writeFileSync } from "node:fs";

const LIVE = "audit/llms-live.txt";
const KW_TS = "src/lib/seo-keywords.ts";
const AUDIT1 = "audit/keyword-audit.json";
const AUDIT2 = "audit/keyword-audit2.json";
const PASS = 70; /* آستانه قبولی — یکسان با دور ۱ و ۲ */

/* ---- نرمال‌سازی فارسی (یکسان با keyword-audit.ts) ---- */
function norm(s) {
  return s
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function wordCount(body) {
  return body.replace(/[#>*`|]/g, " ").split(/\s+/).filter(Boolean).length;
}

/* ---- استخراج {slug → title, body} از llms-live.txt (برگرفته از parseLlmsBodies) ---- */
function parseLlms(text) {
  const lines = text.split("\n");
  const out = {};
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ") && lines[i + 1] && lines[i + 1].startsWith("آدرس:")) {
      if (cur) out[cur.slug] = { title: cur.title, body: cur.body.join("\n").trim() };
      cur = {
        slug: (lines[i + 1].match(/blog\/([^\/\s]+)$/) || [])[1] || "",
        title: line.slice(3).trim(),
        body: [],
        started: false,
      };
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
  if (cur) out[cur.slug] = { title: cur.title, body: cur.body.join("\n").trim() };
  return out;
}

/* ---- خواندن ARTICLE_KEYWORDS / POOL_ARTICLE_KEYWORDS از فایل TS ----
   همه ورودی‌ها به شکل "slug": [ ... ].join(", ") هستند. */
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

/* ---- اجرا ---- */
const live = parseLlms(readFileSync(LIVE, "utf-8"));
const { ARTICLE_KEYWORDS, POOL_ARTICLE_KEYWORDS } = parseKeywordMaps(readFileSync(KW_TS, "utf-8"));
const audit1 = JSON.parse(readFileSync(AUDIT1, "utf-8"));
const audit2 = JSON.parse(readFileSync(AUDIT2, "utf-8"));
const a2by = new Map(audit2.map((x) => [x.slug, x]));

const kwFor = (slug) => ARTICLE_KEYWORDS[slug] || POOL_ARTICLE_KEYWORDS[slug] || [];
const failed40 = audit1.filter((x) => x.score < PASS);

console.log(`llms-live: ${Object.keys(live).length} مقاله | کلیدواژه: ${Object.keys(ARTICLE_KEYWORDS).length}+${Object.keys(POOL_ARTICLE_KEYWORDS).length} | مردود دور۱: ${failed40.length}`);

const rows = [];
for (const x of failed40) {
  const slug = x.slug;
  const kws = kwFor(slug);
  const focus = kws.length ? norm(kws[0]) : norm(x.keyword || "");
  const secondaries = kws.slice(1).map(norm);
  const a2 = a2by.get(slug);
  const after = a2?.after?.score ?? null;
  const metaMissing = (a2?.after?.flags || []).some((f) => f.includes("در-meta"));

  const doc = live[slug];
  const liveTitle = doc?.title || "";
  const body = doc?.body || "";
  const nb = norm(body);
  const nTitle = norm(liveTitle);

  /* پاراگراف اول: اولین بلوک > (پاسخ مستقیم) */
  const direct = norm((body.match(/^>\s*(.+)$/m) || [])[1] || "");
  const paras = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const firstPara = norm((paras.find((p) => !p.startsWith(">")) ?? "").replace(/^#+\s*/, ""));

  const freq = focus ? (nb.match(new RegExp(focus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length : 0;
  const secIn = secondaries.filter((k) => nb.includes(k));
  const secMiss = secondaries.filter((k) => !nb.includes(k));

  const kwInTitle = focus ? nTitle.includes(focus) : null;
  const kwAtTitleStart = focus ? nTitle.startsWith(focus) : null;
  const kwInDirect = focus ? direct.includes(focus) : null;
  const kwInFirstPara = focus ? firstPara.includes(focus) || direct.includes(focus) : null;
  const words = wordCount(body);

  rows.push({
    slug,
    keyword: kws[0] || x.keyword || "—",
    r1: x.score,
    after,
    live: { words, freq, secIn: secIn.length, secTotal: secondaries.length, kwInTitle, kwAtTitleStart, kwInFirstPara },
    metaMissing,
    gaps: [],
    verdict: null,
  });
  const r = rows[rows.length - 1];
  if (!doc) r.gaps.push("مقاله-در-llms-نیست");
  if (kwInTitle === false) r.gaps.push("کلیدواژه-نیست-در-title/H1");
  if (kwAtTitleStart === false) r.gaps.push("کلیدواژه-ابتدای-title-نیست");
  if (metaMissing) r.gaps.push("کلیدواژه-نیست-در-meta");
  if (kwInFirstPara === false) r.gaps.push("کلیدواژه-نیست-در-پاراگراف-اول");
  if (freq === 0) r.gaps.push("فراوانی-صفر");
  else if (freq < 2) r.gaps.push(`فراوانی-کم(${freq})`);
  if (secondaries.length && secMiss.length) r.gaps.push(`مرتبط-${secIn.length}/${secondaries.length}`);
  if (words < 1500) r.gaps.push(`کلمات-کم(${words})`);
  /* حکم نهایی: همان خط‌کش دور ۲ (امتیاز ≥ آستانه)؛ چک زنده فقط راستی‌آزمایی است.
     قبولِ دارای شکاق زنده با * علامت‌گذاری می‌شود (پایش، نه رد). */
  const criticalLive = !doc || kwInTitle === false || freq === 0;
  if (after == null) r.verdict = criticalLive ? "رد" : "قبول";
  else r.verdict = after >= PASS ? (criticalLive ? "قبول*" : "قبول") : "رد";
}

/* ---- خروجی JSON ---- */
writeFileSync("audit/keyword-final-verdict.json", JSON.stringify({ generated: new Date().toISOString(), threshold: PASS, rows }, null, 2));

/* ---- گزارش Markdown ---- */
const passed = rows.filter((r) => r.verdict.startsWith("قبول"));
const failedRows = rows.filter((r) => r.verdict === "رد");
const pct = (n) => `${Math.round((n / rows.length) * 100)}٪`;

let md = `# حکم نهایی رد/قبول ۴۰ مقاله مردود دور اول — راستی‌آزمایی زنده (${new Date().toLocaleDateString("fa-IR")})

- منبع زنده: \`audit/llms-live.txt\` (اسنپ‌شات پروداکشن، شامل تایتل‌های فیکس‌شده)
- امتیاز مرجع: دور ۲ (\`keyword-audit2.json\`) + چک زنده تایتل/H1 و فراوانی بدنه
- آستانه قبولی: **${PASS}** (یکسان با دورهای قبل)

## نتیجه کلی

| وضعیت | تعداد | نسبت |
|---|---|---|
| قبول | ${passed.length} | ${pct(passed.length)} |
| رد | ${failedRows.length} | ${pct(failedRows.length)} |
| جمع | ${rows.length} | ۱۰۰٪ |

## مقالات قبول‌شده (${passed.length})

| اسلاگ | کلیدواژه کانونی | دور ۱ | دور ۲ | فراوانی زنده | ثانویه | شکاق زنده |
|---|---|---|---|---|---|---|
`;
for (const r of passed.sort((a, b) => b.after - a.after)) {
  const liveGaps = r.gaps.filter((g) => !g.startsWith("کلیدواژه-ابتدای"));
  md += `| ${r.slug} | ${r.keyword} | ${r.r1} | ${r.after} | ${r.live.freq} | ${r.live.secIn}/${r.live.secTotal} | ${liveGaps.join("، ") || "—"} |\n`;
}
md += `\n> \* قبول طبق خط‌کش دور ۲ اما با شکاق زنده (فراوانی صفر یا تایتل بدون کلیدواژه) — در لیست پایش مرحله بعد است.`;
md += `\n## مقالات مردود باقی‌مانده (${failedRows.length})\n\n| اسلاگ | کلیدواژه | دور ۱ | دور ۲ | شکاف باقی‌مانده |\n|---|---|---|---|---|\n`;
for (const r of failedRows.sort((a, b) => (a.after ?? 0) - (b.after ?? 0))) {
  md += `| ${r.slug} | ${r.keyword} | ${r.r1} | ${r.after ?? "—"} | ${r.gaps.join("، ") || "—"} |\n`;
}
writeFileSync("audit/keyword-final-verdict.md", md);

/* ---- کنسول ---- */
const strict = passed.filter((r) => r.verdict === "قبول").length;
console.log(`\nحکم نهایی ۴۰ مردود دور اول → قبول: ${passed.length} (${strict} تمیز / ${passed.length - strict} با پایش) | رد: ${failedRows.length}`);
console.log("\nرد باقی‌مانده:");
for (const r of failedRows.sort((a, b) => (a.after ?? 0) - (b.after ?? 0))) {
  console.log(`  ${r.slug} (دور۲: ${r.after ?? "—"}) ← ${r.gaps.join(" ، ")}`);
}
/* ناسازگاری زنده/دور۲ را گزارش کن */
const mismatch = rows.filter((r) => r.verdict === "قبول" && (r.live.kwInFirstPara === false || r.live.secIn < r.live.secTotal - 1));
if (mismatch.length) {
  console.log("\nقبول‌شده‌هایی که زنده شکاق جزئی دارند (پایش شود):");
  for (const r of mismatch) console.log(`  ${r.slug} ← ${r.gaps.join(" ، ") || "—"}`);
}
console.log("\nخروجی: audit/keyword-final-verdict.md + .json");
