#!/usr/bin/env node
/* ============================================================
   ممیزی AEO/SXO صفحات مقالات — dr-kermani.com
   ============================================================
   منبع URLها: sitemap زنده (همه /blog/*)
   روش: دریافت HTML سروری هر مقاله + تحلیل regex + JSON-LD
   خروجی:
     - docs/seo/article-audit/aeo-sxo-<date>.md   (گزارش جدولی)
     - .aeo-sxo-audit.json                        (خروجی خام)
   اجرا: node scripts/audit-aeo-sxo.mjs [--url https://dr-kermani.com]
   معیارها بر اساس: tools/seo/claude-seo (seo-sxo/seo-audit)
                    + docs/standards.md بند ۳ و ۴
   ============================================================ */

const args = process.argv.slice(2);
const urlIdx = args.indexOf("--url");
const BASE = (urlIdx > -1 ? args[urlIdx + 1] : "https://dr-kermani.com").replace(/\/$/, "");

/* ---------- ابزار ---------- */
const fetchTxt = async (u, accept) => {
  const r = await fetch(u, {
    headers: { "user-agent": "AeoSxoAudit/1.0 (+https://dr-kermani.com)", ...(accept ? { accept } : {}) },
    signal: AbortSignal.timeout(30000),
  });
  return { status: r.status, text: await r.text() };
};

const stripTags = (h) =>
  h.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&zwnj;/g, "\u200c").replace(/\s+/g, " ").trim();

const words = (t) => t.split(/\s+/).filter(Boolean);
const numFa = (s) => s.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

/* ---------- JSON-LD ---------- */
function jsonLds(html) {
  const out = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1]));
    } catch { /* خراپ — نادیده */ }
  }
  return out;
}
function graphTypes(doc) {
  const types = new Map(); // type lowercase → آرایه نودها (چند FAQPage ممکن است)
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    const t = n["@type"];
    if (t) [].concat(t).forEach((x) => {
      const k = String(x).toLowerCase();
      if (!types.has(k)) types.set(k, []);
      types.get(k).push(n);
    });
    Object.values(n).forEach(walk);
  };
  doc["@graph"] ? doc["@graph"].forEach(walk) : walk(doc);
  return types;
}

/* ---------- امتیاز AEO ---------- */
function scoreAeo(html, meta) {
  const items = [];
  const add = (pts, max, label) => items.push({ pts, max, label });

  /* انتخاب FAQPage مقاله — صفحه‌های FAQ متعدد ممکن است (سراسری layout + مقاله)؛
     معیار: بیشترین تطابق سوال‌ها با هدینگ‌های مرئی؛ برتری به @id «#faq» */
  const normQ = (s) => stripTags(String(s)).replace(/[\u200c\u064b-\u0652]/g, "").replace(/\s+/g, " ").trim();
  const h3set = new Set(meta.articleH3.map(normQ));
  let faq = null, fq = 0, matchRatio = 0;
  for (const f of meta.faqPages) {
    const qs = f?.mainEntity ?? [];
    const mr = qs.length && h3set.size
      ? qs.filter((q) => h3set.has(normQ(q.name))).length / qs.length
      : 0;
    const better = !faq || mr > matchRatio ||
      (mr === matchRatio && String(f["@id"] || "").endsWith("#faq"));
    if (better) { faq = f; fq = qs.length; matchRatio = mr; }
  }

  /* ۱ — FAQPage schema ≥۴ سوال (سطح مقاله) */
  add(fq >= 4 ? 20 : fq > 0 ? 10 : 0, 20, `FAQPage schema (${fq} سوال)`);

  /* ۲ — تطابق سوالات اسکیما با FAQ قابل‌مشاهده */
  if (fq >= 4 && meta.articleH3.length) {
    add(matchRatio >= 0.8 ? 10 : matchRatio >= 0.5 ? 5 : 0, 10, `تطابق اسکیما/متن FAQ (${Math.round(matchRatio * 100)}٪)`);
  } else add(0, 10, "تطابق اسکیما/متن FAQ (ناموجود)");

  /* ۳ — پاسخ مستقیم ۲۵–۹۰ کلمه در ابتدای بدنه */
  const aw = meta.answerWords, apos = meta.answerPos;
  add(aw >= 25 && aw <= 90 && apos <= 3 ? 25 : aw >= 20 && aw <= 120 ? 15 : aw > 0 ? 8 : 0, 25, `پاسخ مستقیم (${aw} کلمه، بلوک ${apos})`);

  /* ۴ — تیتر پرسشی ≥۲ */
  add(meta.qHeadings >= 2 ? 15 : meta.qHeadings === 1 ? 8 : 0, 15, `تیتر پرسشی (${meta.qHeadings})`);

  /* ۵ — ساختار snippet (لیست/جدول) */
  add(meta.hasList ? 10 : 0, 10, meta.hasList ? "لیست/جدول snippet-پسند" : "فاقد لیست/جدول");

  /* ۶ — BlogPosting کامل */
  const bp = (meta.types.get("blogposting") ?? [])[0];
  const bpOk = bp && bp.author && (bp.datePublished || bp.dateModified) && bp.wordCount && bp.speakable;
  add(bpOk ? 10 : bp ? 5 : 0, 10, `BlogPosting کامل (author/dates/wordCount/speakable${bp?.dateModified ? "+dateModified" : ""})`);

  /* ۷ — title و meta description */
  add(meta.titleOk && meta.descOk ? 10 : meta.titleOk || meta.descOk ? 5 : 0, 10, `title ${meta.titleLen} کاراکتر / desc ${meta.descLen} کاراکتر`);

  return { score: items.reduce((s, i) => s + i.pts, 0), items };
}

/* ---------- امتیاز SXO ---------- */
function scoreSxo(html, meta) {
  const items = [];
  const add = (pts, max, label) => items.push({ pts, max, label });

  /* ۱ — CTA تلفن (داک چسبان سراسری) */
  add(meta.hasTel ? 10 : 0, 10, meta.hasTel ? "CTA تلفن در دسترس" : "CTA تلفن ندارد");

  /* ۲ — نوار CTA پایانی (مشاوره/رزرو نوبت) */
  add(meta.hasCtaBand ? 10 : 0, 10, meta.hasCtaBand ? "نوار CTA پایانی" : "نوار CTA پایانی ندارد");

  /* ۳ — لینک BOFU */
  add(meta.bofuLinks >= 1 ? 15 : 0, 15, `لینک BOFU (${meta.bofuLinks})`);

  /* ۴ — لینک داخلی ≥۵ */
  add(meta.internalLinks >= 5 ? 10 : meta.internalLinks >= 3 ? 6 : 0, 10, `لینک داخلی (${meta.internalLinks})`);

  /* ۵ — فهرست مطالب */
  add(meta.hasToc ? 10 : 0, 10, meta.hasToc ? "فهرست مطالب (دسکتاپ+موبایل)" : "فاقد فهرست مطالب");

  /* ۶ — باکس نویسنده E-E-A-T */
  add(meta.hasAuthorBox ? 15 : meta.hasAuthorName ? 8 : 0, 15, meta.hasAuthorBox ? "باکس نویسنده + رزومه" : meta.hasAuthorName ? "نام نویسنده فقط در متا" : "بدون نویسنده");

  /* ۷ — خوانایی: پاراگراف بلند + برجسته‌سازی */
  const readPts = (meta.maxParaWords <= 120 ? 8 : meta.maxParaWords <= 160 ? 4 : 0) + (meta.strongs >= 3 ? 7 : meta.strongs >= 1 ? 4 : 0);
  add(readPts, 15, `خوانایی (بلندترین پاراگراف ${meta.maxParaWords} کلمه، strong: ${meta.strongs})`);

  /* ۸ — alt تصاویر */
  add(meta.imgCount === 0 ? 0 : meta.altOk ? 10 : 4, 10, `alt تصاویر (${meta.imgAlt}/${meta.imgCount})`);

  /* ۹ — نان‌ریز قابل‌مشاهده */
  add(meta.hasBreadcrumb ? 5 : 0, 5, meta.hasBreadcrumb ? "نان‌ریز مرئی" : "فاقد نان‌ریز مرئی");

  return { score: items.reduce((s, i) => s + i.pts, 0), items };
}

/* ---------- تحلیل یک صفحه ---------- */
async function auditPage(url) {
  const { status, text: html } = await fetchTxt(url);
  if (status !== 200) return { url, status, error: true };

  const meta = { status };
  /* title/desc */
  const t = html.match(/<title>([^<]*)<\/title>/i);
  meta.titleLen = t ? stripTags(t[1]).length : 0;
  meta.titleOk = meta.titleLen > 0 && meta.titleLen <= 65;
  const d = html.match(/<meta name="description" content="([^"]*)"/i);
  meta.descLen = d ? d[1].length : 0;
  meta.descOk = meta.descLen >= 100 && meta.descLen <= 170;

  /* JSON-LD */
  const types = new Map();
  jsonLds(html).forEach((doc) => graphTypes(doc).forEach((v, k) => {
    if (!types.has(k)) types.set(k, v);
    else types.set(k, [...(types.get(k) ?? []), ...v]);
  }));
  meta.types = types;
  meta.faqPages = types.get("faqpage") ?? [];

  /* بدنه مقاله — بین <article ...> و </article> */
  const artMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const art = artMatch ? artMatch[1] : html;

  /* هدینگ‌ها */
  const h2s = [...art.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => stripTags(m[1]));
  meta.articleH3 = [...art.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map((m) => stripTags(m[1]));
  meta.qHeadings = [...h2s, ...meta.articleH3].filter((h) => h.includes("؟")).length;
  meta.h2Count = h2s.length;

  /* پاسخ مستقیم — باکس data-answer (بلاک‌کوت رندرشده)، بدون برچسب «پاسخ کوتاه»
     تطبیق تنبل تا نخستین </div> = بستن div داخلی متن پاسخ — همیشه برچسب + پاسخ */
  const ansMatch = art.match(/<div data-answer="true"[^>]*>([\s\S]*?)<\/div>/i);
  let ansTxt = ansMatch ? ansMatch[1] : "";
  ansTxt = stripTags(ansTxt).replace(/✦\s*پاسخ کوتاه/g, " ").replace(/پاسخ کوتاه/g, " ").trim();
  const ansWords2 = words(ansTxt).length;
  meta.answerWords = ansWords2;
  meta.answerPos = ansTxt ? 1 : 0;

  /* لیست/جدول */
  meta.hasList = /<(ul|ol|table)[^>]*>/i.test(art);

  /* CTA */
  meta.hasTel = /href="tel:/.test(html);
  meta.hasWhatsapp = /wa\.me|whatsapp/i.test(html);
  meta.hasCtaBand = /مشاوره تخصصی|رزرو نوبت|تماس با مطب/.test(stripTags(art.slice(-4000) + html.slice(html.lastIndexOf("مقالات مرتبط") - 2000 > 0 ? html.lastIndexOf("مقالات مرتبط") - 2000 : 0)));

  /* لینک‌ها */
  const hrefs = [...html.matchAll(/href="(\/[^"#]*)"/g)].map((m) => m[1].replace(/\/$/, ""));
  const uniq = [...new Set(hrefs)];
  meta.internalLinks = uniq.filter((u) => !u.startsWith("/uploads") && !/\.(png|jpg|webp|svg|xml|txt|json|ico)$/.test(u)).length;
  const BOFU = ["/costs", "/appointment", "/contact", "/jaw-surgery", "/chin-surgery", "/dental-implant", "/implant-pasdaran", "/gallery"];
  meta.bofuLinks = new Set(uniq.filter((u) => BOFU.some((b) => u === b || u.startsWith(b + "/") || u.startsWith(b + "?")))).size;

  /* TOC + نان‌ریز + نویسنده */
  meta.hasToc = /فهرست مطالب|در این مقاله بخوانید/.test(html);
  meta.hasBreadcrumb = /aria-label="مسیر صفحه"/.test(html);
  meta.hasAuthorBox = /مشاهده رزومه/.test(html) && /دکتر حامد کرمانی/.test(art.slice(-3500));
  meta.hasAuthorName = /نویسنده: دکتر حامد کرمانی/.test(html);

  /* پاراگراف‌ها + strong */
  const paras = [...art.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripTags(m[1])).filter((p) => words(p).length > 3);
  meta.maxParaWords = paras.reduce((mx, p) => Math.max(mx, words(p).length), 0);
  meta.strongs = (art.match(/<strong>/g) || []).length;

  /* تصاویر */
  const imgs = [...art.matchAll(/<img[^>]*>/gi)].map((m) => m[0]);
  meta.imgCount = imgs.length;
  meta.imgAlt = imgs.filter((i) => /alt="[^"]{3,}"/.test(i)).length;
  meta.altOk = meta.imgCount > 0 && meta.imgAlt === meta.imgCount;

  /* تاریخ به‌روزرسانی در اسکیما (freshness) */
  meta.fresh = Boolean((types.get("blogposting") ?? [])[0]?.dateModified);

  const aeo = scoreAeo(html, meta);
  const sxo = scoreSxo(html, meta);
  return { url, status, meta, aeo, sxo, total: aeo.score + sxo.score };
}

/* ---------- اجرا ---------- */
(async () => {
  console.log(`ممیزی AEO/SXO — ${BASE}`);
  const sm = await fetchTxt(`${BASE}/sitemap.xml`);
  const blogUrls = [...sm.text.matchAll(/<loc>([^<]*\/blog\/[^<]*)<\/loc>/g)].map((m) => m[1]);
  console.log(`تعداد مقاله: ${blogUrls.length}`);
  if (!blogUrls.length) { console.error("هیچ مقاله‌ای در sitemap پیدا نشد"); process.exit(1); }

  const results = [];
  for (const u of blogUrls) {
    try {
      results.push(await auditPage(u));
      process.stdout.write(".");
    } catch (e) {
      results.push({ url: u, error: String(e) });
      process.stdout.write("x");
    }
  }
  console.log("");

  const ok = results.filter((r) => !r.error && r.status === 200);
  const avg = (arr, k) => (arr.length ? Math.round(arr.reduce((s, r) => s + r[k].score, 0) / arr.length) : 0);
  const avgAeo = avg(ok, "aeo"), avgSxo = avg(ok, "sxo");

  /* گزارش مارک‌داون */
  const date = new Date().toISOString().slice(0, 16).replace("T", " ");
  const lines = [
    `# ممیزی AEO/SXO صفحات مقالات — ${date}`,
    "",
    `> معیار: claude-seo (seo-sxo + seo-audit) + docs/standards.md بند ۳ و ۴ — AEO و SXO هر دو روی ۱۰۰.`,
    `> منبع: sitemap زنده — ${ok.length} مقاله سالم از ${results.length}.`,
    "",
    "| مقاله | AEO | SXO | کل | یافته‌های اصلی |",
    "|---|---|---|---|---|",
    ...ok.map((r) => {
      const slug = r.url.replace(/^.*\/blog\//, "");
      const fails = [...r.aeo.items, ...r.sxo.items].filter((i) => i.pts < i.max * 0.6).map((i) => i.label);
      return `| [${slug}](${r.url}) | ${r.aeo.score} | ${r.sxo.score} | ${r.total} | ${fails.length ? fails.join("؛ ") : "—"} |`;
    }),
    "",
    `**میانگین AEO: ${avgAeo}/۱۰۰ — میانگین SXO: ${avgSxo}/۱۰۰**`,
  ];

  /* ریز یافته‌های مقالات با امتیاز پایین */
  const weak = ok.filter((r) => r.total < 150).sort((a, b) => a.total - b.total).slice(0, 6);
  if (weak.length) {
    lines.push("", "## ریز یافته — ضعیف‌ترین مقالات", "");
    for (const r of weak) {
      lines.push(`### ${r.url}`, "");
      lines.push("**AEO:**", ...r.aeo.items.map((i) => `- ${i.pts}/${i.max} — ${i.label}`));
      lines.push("", "**SXO:**", ...r.sxo.items.map((i) => `- ${i.pts}/${i.max} — ${i.label}`), "");
    }
  }

  /* تجمیع یافته‌های تکرارشونده (مسیر فیکس) */
  const tally = new Map();
  for (const r of ok) for (const i of [...r.aeo.items, ...r.sxo.items]) {
    if (i.pts < i.max) tally.set(i.label, (tally.get(i.label) ?? 0) + 1);
  }
  lines.push("", "## یافته‌های تکرارشونده (به ترتیب دفعات)", "");
  [...tally.entries()].sort((a, b) => b[1] - a[1]).forEach(([label, n]) => lines.push(`- ${label} — ${n} مقاله`));

  const outMd = `docs/seo/article-audit/aeo-sxo-${new Date().toISOString().slice(0, 10)}.md`;
  const fs = await import("node:fs");
  fs.mkdirSync("docs/seo/article-audit", { recursive: true });
  fs.writeFileSync(outMd, lines.join("\n") + "\n", "utf8");
  fs.writeFileSync(".aeo-sxo-audit.json", JSON.stringify({ date, base: BASE, avgAeo, avgSxo, results }, null, 2), "utf8");
  console.log(`AEO: ${avgAeo}/۱۰۰ | SXO: ${avgSxo}/۱۰۰`);
  console.log(`گزارش: ${outMd}`);
})();
