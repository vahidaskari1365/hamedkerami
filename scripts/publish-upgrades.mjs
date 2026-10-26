#!/usr/bin/env node
/* ============================================================
   ارتقای یک‌باره مقالات قدیمی زنده — content-upgrades/manifest.json
   ─ pool:   متا (تیتر/چکیده/کاور ۳D) از frontmatter فایل pool +
             بدنه غنی‌شده ۱۵۰۰+ کلمه با جدول → جایگزینی کامل ردیف db
   ─ static: بدنه از content-fixes/<slug>.md + متای og صفحه زنده
             (تیتر/کاور ثابت دست‌نخورده)
   انتشار از همان مسیر ایجنت روزانه (/api/agents/publish با
   AGENT_SECRET) — سردبیر QC کامل + چک یکتایی روی هر ردیف اعمال می‌شود.
   ترتیب: اول pool (پاس ۱ + پاس تلاش مجدد) بعد static تا چک یکتایی
   همیشه در برابر نسخه‌های تازه مقایسه کند.
   پس از تأیید موفقیت، manifest در کامیت بعدی حذف می‌شود تا
   دیپلوی‌های بعدی کاری انجام ندهند (خروجی همیشه exit 0 — مانع
   دیپلوی نیست، نتیجه فقط در لاگ Actions دیده می‌شود).
   ============================================================ */
import { readFileSync, existsSync } from "node:fs";

const SITE = (process.env.SITE_URL || "https://dr-kermani.com").replace(/\/$/, "");
const KEY = process.env.AGENT_SECRET || "";
const MANIFEST = "content-upgrades/manifest.json";

if (!KEY) {
  console.error("AGENT_SECRET تنظیم نشده — ارتقا skip شد");
  process.exit(0);
}
if (!existsSync(MANIFEST)) {
  console.log("manifest ارتقا موجود نیست — کاری انجام نشد");
  process.exit(0);
}

const { pool = [], static: staticSlugs = [] } = JSON.parse(readFileSync(MANIFEST, "utf-8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = new Map(); // slug → آخرین نتیجه

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const km = line.match(/^(title|excerpt|cover):\s*(.*)$/);
    if (km) meta[km[1]] = km[2].trim();
  }
  return { meta, body: m[2] };
}

function parsePool(slug) {
  const raw = readFileSync(`content-queue/pool/${slug}.md`, "utf-8");
  const { meta, body } = parseFrontmatter(raw);
  if (!meta.title || !meta.excerpt) throw new Error("frontmatter ناقص (title/excerpt)");
  return { title: meta.title, excerpt: meta.excerpt, cover: meta.cover || undefined, body: body.trim() };
}

async function ogMeta(slug) {
  const html = await (await fetch(`${SITE}/blog/${slug}`)).text();
  const og = (p) => (html.match(new RegExp(`<meta property="og:${p}" content="([^"]*)"`, "u")) || [])[1] || "";
  const title = og("title");
  const excerpt = og("description");
  if (!title || !excerpt) throw new Error("متای og ناقص است");
  return { title, excerpt, cover: og("image").replace(SITE, "") || undefined };
}

/* متای فایل ثابت: فرانت‌متر اختیاری (title/excerpt/cover) وگرنه og زنده */
async function staticMeta(slug) {
  const raw = readFileSync(`content-fixes/${slug}.md`, "utf-8");
  const { meta, body } = parseFrontmatter(raw);
  const og = meta.title && meta.excerpt ? null : await ogMeta(slug);
  return {
    title: meta.title || og.title,
    excerpt: meta.excerpt || og.excerpt,
    cover: meta.cover || og?.cover || undefined,
    body: body.trim(),
  };
}

async function upgrade(slug, source) {
  try {
    const meta =
      source === "pool"
        ? parsePool(slug)
        : await staticMeta(slug);
    const keyword = meta.title.split(/[؛|؟]/)[0].trim().slice(0, 60);
    const res = await fetch(`${SITE}/api/agents/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-agent-key": KEY },
      body: JSON.stringify({ slug, title: meta.title, excerpt: meta.excerpt, body: meta.body, keyword, cover: meta.cover }),
    });
    const out = await res.json().catch(() => ({}));
    const r = { slug, ok: res.ok && out.ok !== false, status: res.status, reason: out.reason || out.error || "" };
    results.set(slug, r);
    console.log(`${r.ok ? "✔" : "✗"} ${slug} — HTTP ${r.status} ${r.reason}`.trimEnd());
  } catch (e) {
    results.set(slug, { slug, ok: false, status: 0, reason: e.message });
    console.log(`✗ ${slug} — ${e.message}`);
  }
  await sleep(900);
}

(async () => {
  console.log(`ارتقای مقالات: ${pool.length} pool + ${staticSlugs.length} ثابت`);
  for (const s of pool) await upgrade(s, "pool");
  /* تلاش مجدد ناموفق‌های pool — بعد از جایگزینی بقیه ردیف‌ها
     (چک یکتایی ممکن است در میانه موج به بدنه قدیمی خورده باشد) */
  for (const s of pool.filter((s) => results.get(s)?.ok === false)) await upgrade(s, "pool");
  for (const s of staticSlugs) await upgrade(s, "static");

  const all = [...results.values()];
  const ok = all.filter((r) => r.ok).length;
  console.log(`\nنتیجه ارتقا: ${ok}/${all.length} به‌روز شد`);
  const failed = all.filter((r) => !r.ok);
  if (failed.length) {
    console.log("ناموفق‌ها:", failed.map((f) => `${f.slug}(${(f.reason || "").slice(0, 120)})`).join(" | "));
  }
  process.exit(0); /* مانع دیپلوی نیست — فقط گزارش */
})();
