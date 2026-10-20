#!/usr/bin/env node
/* ============================================================
   GSC Analyzer — موتور چرخه ۲ ماهه سئو (دسته ۴)
   ورودی: خروجی CSV گوگل‌سرچ‌کنسول (Performance → Export یا
   Download جدول). دو CSV رایج: Queries و Pages — هرکدام را
   که بدهید تحلیل می‌کند؛ اگر هر دو بدهید تحلیل کامل می‌شود.

   اجرا:
     node tools/gsc-analyzer.mjs Queries.csv [Pages.csv] \
          [--min-imp 30] [--out docs/seo/gsc-reports]

   خروجی: گزارش مارک‌داون اولویت‌دار (stdout + ذخیره در فایل):
     ۱) شکارِ فاصله صفحه ۱  (رتبه ۴–۲۰ — نزدیک‌ترین‌ها به صدر)
     ۲) CTR پایین با رتبه خوب (بازنویسی عنوان/توضیحات متا)
     ۳) پتانسیل پنهان (ایمپرشن بالا، تقریباً صفر کلیک)
     ۴) صفحات ضعیف (وقتی Pages.csv داده شده)
     ۵) چک‌لیست اقدام این دور

   بدون هیچ وابستگی خارجی — فقط Node استاندارد.
   ============================================================ */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

/* ---------------- CLI ---------------- */
const args = process.argv.slice(2);
const flags = { "--min-imp": 30, "--out": "docs/seo/gsc-reports" };
const files = [];
for (let i = 0; i < args.length; i++) {
  if (flags["--" + args[i].slice(2)] !== undefined && args[i].startsWith("--")) {
    flags[args[i]] = Number(args[i + 1]) || args[i + 1];
    i++;
  } else if (args[i].startsWith("--")) {
    flags[args[i]] = args[i + 1];
    i++;
  } else files.push(args[i]);
}
const MIN_IMP = Number(flags["--min-imp"]) || 30;
const OUT_DIR = String(flags["--out"]);

if (!files.length) {
  console.error("Usage: node tools/gsc-analyzer.mjs <Queries.csv> [Pages.csv] [--min-imp 30] [--out docs/seo/gsc-reports]");
  process.exit(1);
}

/* ---------------- CSV parser (BOM + quote-safe) ---------------- */
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQ = false;
      } else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell.length || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

const num = (s) => {
  if (s == null) return NaN;
  const t = String(s).replace(/[–−]/g, "-").replace(/[",\s]/g, "").replace(/٪|%/g, "");
  if (!t.length || t === "-" || t === "N/A") return NaN;
  const v = Number(t);
  return Number.isFinite(v) ? v : NaN;
};
const ctr = (s) => {
  if (s == null) return NaN;
  const t = String(s).replace(/[%\s]/g, "").replace(",", ".");
  const v = Number(t);
  if (!Number.isFinite(v)) return NaN;
  return v <= 1 && String(s).includes("%") ? v / 100 : v <= 1 && !String(s).includes("%") && v > 0 ? v : v > 1 ? v / 100 : v;
};

/* ---------------- قرائت فایل‌ها ---------------- */
function readTable(path) {
  const rows = parseCsv(readFileSync(path, "utf8"));
  if (!rows.length) return { kind: "query", rows: [] };
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (...names) => {
    for (const n of names) {
      const i = head.findIndex((h) => h === n || h.startsWith(n));
      if (i !== -1) return i;
    }
    return -1;
  };
  const labelI = 0;
  const clicksI = col("clicks");
  const impI = col("impression");
  const ctrI = col("ctr");
  const posI = col("position");
  const isPages = /page|address/.test(head[labelI]) && !/query|کوئری|عبارت/.test(head[labelI]);
  const data = [];
  for (let r = 1; r < rows.length; r++) {
    const label = (rows[r][labelI] || "").trim();
    if (!label || /^totals?$/i.test(label)) continue;
    data.push({
      label,
      clicks: num(rows[r][clicksI]) || 0,
      impressions: num(rows[r][impI]) || 0,
      ctr: ctr(rows[r][ctrI]),
      position: num(rows[r][posI]),
    });
  }
  return { kind: isPages ? "page" : "query", rows: data };
}

const tables = files.map(readTable);
const queries = tables.find((t) => t.kind === "query")?.rows ?? [];
const pages = tables.find((t) => t.kind === "page")?.rows ?? [];

/* ---------------- تحلیل‌ها ---------------- */
/* CTR مرجع برای رتبه ۱..۱۰ (میانگین صنعتی سلامت) */
const CTR_BENCH = [0.28, 0.18, 0.11, 0.08, 0.06, 0.05, 0.042, 0.036, 0.03, 0.027];
const bench = (pos) => (pos <= 10 ? CTR_BENCH[Math.ceil(pos) - 1] : 0.02);
const pct = (v) => (Number.isFinite(v) ? (v * 100).toFixed(1) + "%" : "—");

const striking = queries
  .filter((q) => q.impressions >= MIN_IMP && q.position >= 4 && q.position <= 20)
  .sort((a, b) => b.impressions * (21 - b.position) - a.impressions * (21 - a.position));

const ctrWins = queries
  .filter((q) => q.position > 0.2 && q.position <= 3.5 && q.impressions >= MIN_IMP && Number.isFinite(q.ctr) && q.ctr < bench(q.position) * 0.7)
  .sort((a, b) => a.position - b.position);

const hidden = queries
  .filter((q) => q.impressions >= 100 && q.clicks <= 1 && q.position <= 25)
  .sort((a, b) => b.impressions - a.impressions);

const weakPages = pages
  .filter((p) => p.impressions >= 50 && (p.position > 20 || !Number.isFinite(p.position)))
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 25);

const lowCtrPages = pages
  .filter((p) => p.impressions >= 100 && p.position <= 8 && Number.isFinite(p.ctr) && p.ctr < 0.05)
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 25);

/* ---------------- گزارش ---------------- */
const today = new Date().toISOString().slice(0, 10);
const L = [];
const table = (headers, rows) => {
  L.push("| " + headers.join(" | ") + " |");
  L.push("|" + headers.map(() => "---").join("|") + "|");
  for (const r of rows) L.push("| " + r.join(" | ") + " |");
  L.push("");
};

L.push(`# گزارش GSC — دور به‌روزرسانی ${today}`);
L.push("");
L.push(`- ورودی: ${files.map((f) => "`" + f + "`").join(" و ")}`);
L.push(`- آستانه ایمپرشن: ${MIN_IMP} — کوئری‌های تحلیل‌شده: ${queries.length} — صفحات: ${pages.length}`);
L.push("- محدوده تاریخ: همان بازه‌ای که در GSC برای Export انتخاب شده (در پنل ثبت شود)");
L.push("");
L.push("> اقدام این دور: هر ردیف → «کدام مقاله / کدام متا» را مشخص کن، بعد اجرا و دیپلوی؛");
L.push("> بعد از دیپلوی، Request indexing برای صفحات تغییر یافته.");
L.push("");

L.push("## ۱) شکارِ فاصله صفحه ۱ (رتبه ۴–۲۰) — بیشترین اولویت");
L.push("");
if (striking.length) {
  table(["کوئری", "کلیک", "ایمپرشن", "CTR", "رتبه", "سود بالقوه"], striking.slice(0, 30).map((q) => [
    q.label, q.clicks, q.impressions, pct(q.ctr), q.position.toFixed(1),
    `~${Math.round(q.impressions * 0.1)} کلیک/ماه اگر به رتبه ≤۵ برسد`,
  ]));
} else L.push("_موردی یافت نشد با آستانه فعلی — آستانه را با `--min-imp` کمتر کن._\n");

L.push("## ۲) CTR پایین با رتبه خوب — بازنویسی عنوان/توضیحات متا");
L.push("");
if (ctrWins.length) {
  table(["کوئری", "رتبه", "ایمپرشن", "CTR فعلی", "CTR مرجع"], ctrWins.slice(0, 20).map((q) => [
    q.label, q.position.toFixed(1), q.impressions, pct(q.ctr), pct(bench(q.position)),
  ]));
} else L.push("_موردی یافت نشد — CTRها نسبت به رتبه سالم‌اند._\n");

L.push("## ۳) پتانسیل پنهان (ایمپرشن ≥۱۰۰، کلیک ≤۱)");
L.push("");
if (hidden.length) {
  table(["کوئری", "رتبه", "ایمپرشن", "کلیک"], hidden.slice(0, 20).map((q) => [
    q.label, Number.isFinite(q.position) ? q.position.toFixed(1) : "—", q.impressions, q.clicks,
  ]));
} else L.push("_موردی یافت نشد._\n");

if (pages.length) {
  L.push("## ۴) صفحات نیازمند تقویت محتوا (ایمپرشن ≥۵۰، رتبه >۲۰)");
  L.push("");
  if (weakPages.length) {
    table(["صفحه", "کلیک", "ایمپرشن", "رتبه"], weakPages.map((p) => [
      p.label, p.clicks, p.impressions, Number.isFinite(p.position) ? p.position.toFixed(1) : "—",
    ]));
  } else L.push("_صفحه ضعیفی با این آستانه نیست._\n");

  L.push("## ۵) صفحات با رتبه خوب ولی کلیک کم — تایتل/متا بازنویسی شود");
  L.push("");
  if (lowCtrPages.length) {
    table(["صفحه", "رتبه", "ایمپرشن", "CTR"], lowCtrPages.map((p) => [
      p.label, p.position.toFixed(1), p.impressions, pct(p.ctr),
    ]));
  } else L.push("_سالم است._\n");
}

L.push("## چک‌لیست اجرای این دور");
L.push("");
L.push("- [ ] برای هر کوئری بخش ۱، مقاله/لندینگ هدف را مشخص کن (تطبیق دستی با map محتوایی)");
L.push("- [ ] به مقاله هدف سکشن FAQ با همان کوئری اضافه شود (AEO)");
L.push("- [ ] عنوان/توضیحات متای صفحات بخش ۲ و ۵ بازنویسی شود (شامل کوئری دقیق)");
L.push("- [ ] محتوای تازه + lastmod جدید → دیپلوی");
L.push("- [ ] Request indexing در GSC برای URLهای تغییریافته");
L.push("- [ ] یادداشت «قبل» در همین فایل: رتبه/CTR فعلی برای مقایسه دور بعد");

const report = L.join("\n");
console.log(report);

const outPath = join(resolve(OUT_DIR), `gsc-report-${today}.md`);
if (!existsSync(resolve(OUT_DIR))) mkdirSync(resolve(OUT_DIR), { recursive: true });
writeFileSync(outPath, report, "utf8");
console.error(`\n✔ گزارش ذخیره شد: ${outPath}`);
