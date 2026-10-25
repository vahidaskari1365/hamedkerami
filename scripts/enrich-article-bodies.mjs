#!/usr/bin/env node
/* ============================================================
   غنی‌سازی بدنه مقاله‌های قدیمی (SXO خوانایی) — بدون تغییر معنا
   ۱) پاراگراف بلند (>۱۲۰ کلمه) در مرز جمله شکسته می‌شود
   ۲) توپر (**عبارت**) روی عبارات حاوی آمار/واحد + عبارات موضوعی
   ۳) لینک داخلی/BOFU در صورت کمبود — فقط پوشش عبارات واقعی متن
   ۴) اعتبارسنجی محلی mirrors سردبیر publish.ts (گیت relaxed-update)
   خروجی: content-fixes/<slug>.md
   تطبیق عبارت: فازی — نیم‌فاصله/فاصله یکی می‌شوند (فارسی واقعی)
   ============================================================ */

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";

const SITE = (process.env.SITE_URL || "https://dr-kermani.com").replace(/\/$/, "");
const OUT = "content-fixes";
const PHONE = "۰۹۳۸-۲۰۸۰۲۷۰";
const BOFU_RE = /\/(costs|appointment|contact|jaw-surgery|chin-surgery|dental-implant|implant-pasdaran|gallery)/;

/* ---------- ابزارهای مشترک با uniqueness.ts ---------- */
function normalizeFa(s) {
  return s
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[«»"'“”(){}\[\]#>*`_|.,؛:!؟?٪%+\-–—…]/g, " ")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function significantSentences(body) {
  const plain = body
    .replace(/^(#{1,6})\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1");
  const seen = new Set();
  for (const raw of plain.split(/[\n.؟?!؛]+/)) {
    const norm = normalizeFa(raw);
    if (norm.split(" ").filter(Boolean).length >= 6) seen.add(norm);
  }
  return [...seen];
}
function countWords(body) {
  return body.replace(/[#>*`]/g, " ").split(/\s+/).filter(Boolean).length;
}
function repeatedSentences(body, otherBodies) {
  const mine = new Set(significantSentences(body));
  const hits = [];
  for (const other of otherBodies) {
    for (const s of significantSentences(other)) {
      if (mine.has(s)) hits.push(s);
      if (hits.length >= 3) return hits;
    }
  }
  return hits;
}

/* ---------- تطبیق فازی عبارت فارسی ----------
   نیم‌فاصله/فاصله یکی + پسوند جمع «های» اختیاری بعد هر کلمه */
function phraseRegex(phrase) {
  const words = phrase
    .trim()
    .split(/[\s\u200c]+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return null;
  /* String.raw — تا \s و \u200c به‌صورت الگوی regex بمانند (نه کاراکتر رشته) */
  const sep = String.raw`[\s\u200c]+`;
  const suffix = String.raw`(?:[\s\u200c]+های)?`;
  const seg = words.map((w) => w + suffix).join(sep);
  return new RegExp(seg, "g");
}
/** اولین موقعیت امن (خارج لینک/بولد موجود) — خروجی {at,len,match} یا null */
function findSafe(text, phrase) {
  const re = phraseRegex(phrase);
  let m;
  while ((m = re.exec(text))) {
    const at = m.index;
    const len = m[0].length;
    const before = text.slice(Math.max(0, at - 260), at);
    const opens = (before.match(/\[/g) || []).length - (before.match(/\]/g) || []).length;
    const boldOpen = (before.match(/\*\*/g) || []).length % 2;
    const after = text[at + len];
    if (opens === 0 && !boldOpen && !/[\[\*]/.test(after || "")) return { at, len, match: m[0] };
  }
  return null;
}

/* ---------- ساختار پاراگراف ---------- */
function words(n) {
  return n.trim().split(/\s+/).filter(Boolean).length;
}
function isPlainPara(t) {
  return t && !/^(#|>|\||-|\*|\d+[.)])/.test(t.trim());
}
function collectParagraphs(body) {
  return body.split(/\n\n+/).filter(isPlainPara);
}

/* ---------- ۱ — تقسیم پاراگراف بلند (فقط مرز جمله) ---------- */
function splitLongParagraphs(body, limit = 118) {
  let splits = 0;
  const out = body.split(/\n\n+/).map((para) => {
    const t = para.trim();
    if (!isPlainPara(t)) return para;
    if (words(t) <= limit) return para;
    const parts = [];
    let cur = "";
    for (const tok of t.split(/(?<=[.؟!])\s+|(?<=؛)\s+/)) {
      if (cur && words(cur) + words(tok) > limit && words(cur) >= 35) {
        parts.push(cur.trim());
        cur = tok;
      } else {
        cur = cur ? `${cur} ${tok}` : tok;
      }
    }
    if (cur.trim()) parts.push(cur.trim());
    if (parts.length < 2) return para;
    splits += parts.length - 1;
    return parts.join("\n\n");
  });
  return { body: out.join("\n\n"), splits };
}

/* ---------- ۲ — توپر ---------- */
const UNITS = "میلیون|تومان|درصد|هفته|ماه|روز|سال|ساعت|میلی\u200cمتر|سانتی\u200cمتر|کیلوگرم|بیمار|جراحی";
function pickBolds(body, want = 5) {
  const paras = collectParagraphs(body);
  const used = [];
  const plan = [];
  const numRe = new RegExp(
    `[۰-۹0-9][۰-۹0-۹]*\\s*(?:تا\\s*[۰-۹0-۹]+\\s*)?(?:${UNITS})[^\\s.,،؛!؟]*`,
    "g",
  );
  for (const p of paras) {
    if (plan.length >= want) break;
    for (const m of p.matchAll(numRe)) {
      if (plan.length >= want) break;
      let phrase = m[0].trim().replace(/[،؛,]+$/, "");
      /* اگر وسط عدد بزرگ بریده شد (مثل «۰۰۰ جراحی» از «۲۰,۰۰۰ جراحی») —
         ابتدای عبارت تا شروع کامل عدد به عقب کشیده می‌شود */
      let start = m.index;
      while (start > 0 && /[۰-۹0-9,،]/.test(p[start - 1])) start -= 1;
      if (start < m.index) phrase = p.slice(start, m.index + m[0].length).trim().replace(/[،؛,]+$/, "");
      if (!phrase || words(phrase) > 7) continue;
      if (used.includes(phrase)) continue;
      if (!findSafe(p, phrase)) continue;
      plan.push({ para: p, phrase });
      used.push(phrase);
      break; /* حداکثر یک توپر عددی از هر پاراگراف */
    }
  }
  return plan;
}
function applyBoldAt(body, para, at, len, match) {
  const idx = body.indexOf(para);
  if (idx < 0) return body;
  const newPara = para.slice(0, at) + `**${match.trim()}**` + para.slice(at + len);
  return body.slice(0, idx) + newPara + body.slice(idx + para.length);
}
function applyBolds(body, plan) {
  let applied = 0;
  const list = [];
  for (const { para, phrase } of plan) {
    const hit = findSafe(para, phrase);
    if (!hit) continue;
    body = applyBoldAt(body, para, hit.at, hit.len, hit.match);
    applied += 1;
    list.push(phrase);
  }
  return { body, applied, list };
}
/* فاز دستی — عبارات کاری Each مقاله */
const BOLD_EXTRA = {
  "bimax-surgery-cost-1405": ["هزینه جراحی دو فک", "جراحی بایمکس", "برنامه‌ریزی مالی", "بیهوشی عمومی", "جراحی تک‌فک"],
  "blepharoplasty-cost-1405": ["هزینه بلفاروپلاستی", "بلفاروپلاستی", "بلفاروپلاستی زیبایی"],
  "jaw-surgery-insurance": ["پوشش بیمه", "بیمه پایه", "بیمه تکمیلی"],
  "jaw-surgery-pain": ["درد پس از جراحی فک", "درد بعد از جراحی", "کنترل درد"],
  "zygomatic-implant-guide": ["ایمپلنت زایگوماتیک", "استخوان فک بالا"],
  "wisdom-tooth-surgery-cost-1405": ["جراحی دندان عقل", "هزینه جراحی دندان عقل"],
  "best-implant-brands": ["برند ایمپلنت", "ایمپلنت"],
  "genioplasty-cost": ["جنیوپلاستی", "هزینه جنیوپلاستی"],
};
function applyExtraBolds(body, phrases, wantTotal = 4) {
  let applied = 0;
  const miss = [];
  for (const phrase of phrases) {
    if ((body.match(/\*\*[^*]+\*\*/g) || []).length >= wantTotal) break;
    if (!phraseRegex(phrase).test(body)) {
      miss.push(`عبارت یافت نشد: «${phrase}»`);
      continue;
    }
    let done = false;
    for (const p of collectParagraphs(body)) {
      if (p.includes(`**${phrase}**`)) continue;
      const hit = findSafe(p, phrase);
      if (!hit) continue;
      body = applyBoldAt(body, p, hit.at, hit.len, hit.match);
      applied += 1;
      done = true;
      break;
    }
    if (!done) miss.push(`موقعیت امن نبود: «${phrase}»`);
  }
  return { body, applied, miss };
}

/* ---------- ۳ — لینک داخلی ---------- */
const LINK_PLAN = [
  { phrase: "هزینه جراحی فک و صورت", target: "/costs" },
  { phrase: "هزینه خدمات", target: "/costs" },
  { phrase: "تعرفه‌ها", target: "/costs" },
  { phrase: "تعرفه", target: "/costs" },
  { phrase: "هزینه ایمپلنت دندان", target: "/blog/dental-implant-cost-1405" },
  { phrase: "هزینه جراحی فک", target: "/blog/jaw-surgery-cost-1405" },
  { phrase: "رزرو نوبت", target: "/appointment" },
  { phrase: "نوبت‌دهی آنلاین", target: "/appointment" },
  { phrase: "مشاوره تخصصی", target: "/appointment" },
  { phrase: "جراحی فک و صورت", target: "/jaw-surgery" },
  { phrase: "جراحی ارتوگناتیک", target: "/jaw-surgery" },
  { phrase: "جراحی دو فک", target: "/jaw-surgery" },
  { phrase: "جراحی دندان عقل", target: "/jaw-surgery" },
  { phrase: "جراحی زیبایی چانه", target: "/chin-surgery" },
  { phrase: "ایمپلنت دندان", target: "/dental-implant" },
  { phrase: "ایمپلنت دندانی", target: "/dental-implant" },
  { phrase: "ایمپلنت", target: "/dental-implant" },
  { phrase: "ایمپلنت پاسداران", target: "/implant-pasdaran" },
  { phrase: "گالری نتایج", target: "/gallery" },
  { phrase: "مراقبت‌های بعد از جراحی", target: "/blog/jaw-surgery-recovery-care" },
  { phrase: "قیمت ایمپلنت", target: "/costs" },
  { phrase: "کاشت دندان", target: "/dental-implant" },
  { phrase: "قیمت", target: "/costs" },
  { phrase: "تماس بگیرید", target: "/contact" },
  { phrase: "خدمات", target: "/services" },
  { phrase: "مشاوره", target: "/appointment" },
  { phrase: "گالری", target: "/gallery" },
  { phrase: "تماس با مطب", target: "/contact" },
];
function addLinks(body, need, needBofu, existingTargets, slug) {
  const added = [];
  const targets = new Set(existingTargets);
  const usedPhrases = new Set();
  let guard = 0;
  /* دو فاز: اول اهداف تکرارنشده — بعد اجازه هدف تکراری با عبارت متفاوت */
  for (const allowUsedTarget of [false, true]) {
    while (added.length < need && guard++ < 60) {
      let placed = false;
      for (const { phrase, target } of LINK_PLAN) {
        if (added.length >= need) break;
        if (needBofu && added.length === 0 && !BOFU_RE.test(target)) continue;
        if (usedPhrases.has(phrase)) continue;
        if (!allowUsedTarget && targets.has(target)) continue;
        if (target.endsWith(`/${slug}`)) continue; /* لینک به خود مقاله ممنوع */
        /* عبارت نباید خودش داخل لینک موجود باشد */
        if (new RegExp(`\\[[^\\]]*${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(body)) continue;
        for (const p of collectParagraphs(body)) {
          const hit = findSafe(p, phrase);
          if (!hit) continue;
          body = wrapLink(body, p, hit, target);
          added.push({ phrase, target });
          targets.add(target);
          usedPhrases.add(phrase);
          placed = true;
          break;
        }
        if (placed) break;
      }
      if (!placed) break;
    }
    if (added.length >= need) break;
  }
  return { body, added };
}
function wrapLink(body, para, hit, target) {
  const idx = body.indexOf(para);
  if (idx < 0) return body;
  const phrase = hit.match.trim();
  const newPara = para.slice(0, hit.at) + `[${phrase}](${target})` + para.slice(hit.at + hit.len);
  return body.slice(0, idx) + newPara + body.slice(idx + para.length);
}

/* ---------- اعتبارسنجی محلی — mirror گیت‌های publish.ts ---------- */
function validate(slug, title, body, otherBodies) {
  const wordsCount = countWords(body);
  const hasAnswer = body.trimStart().startsWith(">");
  const answerLine = body.split("\n").find((l) => l.trimStart().startsWith(">")) ?? "";
  const answerWords = countWords(answerLine.replace(/^>\s?/, ""));
  const faqCount = (body.match(/^### .+/gm) || []).length;
  const qHeadings = (body.match(/^#{2,3} .+؟/gm) || []).length;
  const numbers = (body.match(/[۰-۹0-9]+/g) || []).length;
  const bofuLinks = (body.match(new RegExp(`\\]\\((\\/[^)]*)\\)`, "g")) || []).filter((m) => BOFU_RE.test(m)).length;
  const bolds = (body.match(/\*\*[^*]+\*\*/g) || []).length;
  const internalLinks = (body.match(/\]\((\/[^)]*)\)/g) || []).length;
  const hasForbidden = /`|\$\{|!\[|\]\(https?:|<\/?[a-zA-Z][^>]*>/.test(body);
  const dup = repeatedSentences(body, otherBodies);
  const checks = [
    ["طول ≥۱۴۰۰ (relaxed-update)", wordsCount >= 1400, true],
    ["پاسخ مستقیم ندارد", !hasAnswer, false],
    ["پاسخ خارج ۲۵–۹۰", hasAnswer && (answerWords < 25 || answerWords > 90), false],
    ["FAQ <۴", faqCount < 4, false],
    ["تیتر پرسشی <۲", qHeadings < 2, false],
    ["عدد <۳ (relaxed-update)", numbers < 3, true],
    ["BOFU ندارد", bofuLinks < 1, false],
    ["توپر <۲", bolds < 2, false],
    ["CTA ندارد", !body.includes(PHONE), false],
    ["نام دکتر نیست", !/کرمانی|کرانیوفاسیال/.test(body), false],
    ["لینک داخلی <۴", internalLinks < 4, false],
    ["الگوی ممنوعه", hasForbidden, false],
    ["جمله تکراری", dup.length > 0, false],
    ["لینک حل‌نشده", body.includes("LINKTARGET"), false],
  ];
  const failed = checks.filter(([, bad, warn]) => bad && !warn).map(([r]) => r);
  const warns = checks.filter(([, bad, warn]) => bad && warn).map(([r]) => r);
  return { wordsCount, bolds, faqCount, answerWords, internalLinks, dup, failed, warns };
}

/* ---------- اجرا ---------- */
(async () => {
  const res = await fetch(`${SITE}/api/content`);
  const data = await res.json();
  const posts = (data.content || data).blogPosts || [];
  console.log(`مقالات دریافتی: ${posts.length}`);

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const report = [];
  for (const post of posts) {
    const others = posts.filter((p) => p.slug !== post.slug).map((p) => p.body);
    let body = post.body;
    const notes = [];

    /* ۱ — تقسیم پاراگراف بلند */
    const s1 = splitLongParagraphs(body);
    body = s1.body;
    if (s1.splits) notes.push(`${s1.splits} تقسیم پاراگراف`);

    /* ۲ — لینک داخلی در صورت کمبود */
    const linksNow = (body.match(/\]\((\/[^)]*)\)/g) || []).length;
    const bofuNow = (body.match(/\]\((\/[^)]*)\)/g) || []).filter((m) => BOFU_RE.test(m)).length;
    let linksAdded = [];
    if (linksNow < 4 || bofuNow < 1) {
      const targets = [...body.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1].split(/[?#]/)[0]);
      const r = addLinks(body, Math.max(0, 4 - linksNow), bofuNow < 1, targets, post.slug);
      body = r.body;
      linksAdded = r.added;
      if (linksAdded.length) notes.push(`+${linksAdded.length} لینک: ${linksAdded.map((a) => `${a.phrase}→${a.target}`).join(" ، ")}`);
    }

    /* ۳ — توپر تا حداقل ۴ */
    let boldList = [];
    if ((body.match(/\*\*[^*]+\*\*/g) || []).length < 4) {
      const plan = pickBolds(body, 5);
      const r1 = applyBolds(body, plan);
      body = r1.body;
      boldList = r1.list;
      if ((body.match(/\*\*[^*]+\*\*/g) || []).length < 4) {
        const r2 = applyExtraBolds(body, BOLD_EXTRA[post.slug] || [], 4);
        body = r2.body;
        for (const m of r2.miss) notes.push(`✗ ${m}`);
      }
      if (boldList.length || (body.match(/\*\*[^*]+\*\*/g) || []).length) {
        const total = (body.match(/\*\*[^*]+\*\*/g) || []).length;
        notes.push(`توپر: مجموع ${total} — ${boldList.slice(0, 6).join(" ، ")}`);
      }
    }

    const v = validate(post.slug, post.title, body, others);
    writeFileSync(path.join(OUT, `${post.slug}.md`), body.trim() + "\n", "utf-8");
    report.push({
      slug: post.slug,
      splits: s1.splits,
      bolds: v.bolds,
      links: v.internalLinks,
      bofu: bofuNow,
      words: v.wordsCount,
      gateOk: v.failed.length === 0,
      failed: v.failed.join("|"),
      warns: v.warns.join("|"),
    });
    if (notes.length) console.log(`\n■ ${post.slug}\n   ${notes.join("\n   ")}`);
  }

  console.table(report.map(({ slug, splits, bolds, links, words, gateOk, failed, warns }) => ({
    slug, splits, bolds, links, words, gateOk, failed, warns,
  })));
  const bad = report.filter((r) => !r.gateOk);
  console.log(`\nگیت محلی: ${report.length - bad.length}/${report.length} پاس — فایل‌ها در ${OUT}/`);
  if (bad.length) console.log("ردشده‌ها:", bad.map((b) => `${b.slug}[${b.failed}]`).join(", "));
})().catch((e) => {
  console.error("خطا:", e.message);
  process.exit(1);
});
