import { readFileSync, existsSync } from "node:fs";
import { BLOG_ARTICLES } from "../src/lib/blog-articles";

/* شبیه‌ساز گیت‌های /api/agents/publish برای فایل‌های content-fixes
   تا قبل از دیپلوی مطمئن شویم سردبیر هیچ مقاله‌ای را رد نمی‌کند. */

function splitFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const km = line.match(/^(title|excerpt|cover):\s*(.*)$/);
    if (km) meta[km[1]] = km[2].trim();
  }
  return { meta, body: m[2] };
}

function countWords(body: string): number {
  return body.replace(/[#>*`|]/g, " ").split(/\s+/).filter(Boolean).length;
}

const SLUGS = [
  "facial-contouring", "v-line-jaw-reduction", "jaw-botox-masseter", "genioplasty-cost",
  "tmj-pain-treatment", "jaw-surgery-age", "maxillofacial-vs-plastic-surgeon",
  "jaw-surgery-orthodontics", "sleep-apnea-mma-surgery", "jaw-fracture-surgery",
  "jaw-surgery-before-after", "jaw-surgery-complications", "jaw-surgery-recovery-care",
  "best-jaw-surgeon-tehran", "jaw-asymmetry",
];

let allOk = true;
for (const slug of SLUGS) {
  const path = `content-fixes/${slug}.md`;
  let meta: Record<string, string> = {};
  let body: string;
  if (existsSync(path)) {
    const parsed = splitFrontmatter(readFileSync(path, "utf-8"));
    meta = parsed.meta;
    body = parsed.body;
  } else {
    const seed = BLOG_ARTICLES.find((a) => a.slug === slug)!;
    meta = { title: seed.title, excerpt: seed.excerpt };
    body = seed.body;
  }
  const title = meta.title ?? "";
  const fails: string[] = [];

  const answerLine = body.split("\n").find((l) => l.trimStart().startsWith(">")) ?? "";
  const answerWords = countWords(answerLine.replace(/^>\s?/, ""));
  const hasAnswer = answerLine.length > 0;
  const faqCount = (body.match(/^### .+/gm) || []).length;
  const qHeadings = (body.match(/^#{2,3} .+؟/gm) || []).length;
  const numbers = (body.match(/[۰-۹0-9]+/g) || []).length;
  const bofuLinks = (body.match(/\]\((\/(costs|appointment|contact|jaw-surgery|chin-surgery|dental-implant|implant-pasdaran|gallery)[^)]*)\)/g) || []).length;
  const bolds = (body.match(/\*\*[^*]+\*\*/g) || []).length;
  const internalLinks = (body.match(/\]\((\/[^)]*)\)/g) || []).length;
  const hasForbidden = /```|\$\{|<[a-z]|https?:\/\/|\!\[[^\]]*\]\(/.test(body);
  const hasCta = /(تماس|مشاوره|واتساپ|۰۹۳۸|نوبت)/.test(body);
  const nameMention = /(دکتر حامد کرمانی|دکتر کرمانی|فلوشیپ)/.test(body);

  const words = countWords(body);
  if (words < 1500) fails.push(`words=${words}`);
  if (!hasAnswer) fails.push("no answer");
  if (hasAnswer && (answerWords < 25 || answerWords > 90)) fails.push(`answer=${answerWords}w`);
  if (faqCount < 4) fails.push(`faq=${faqCount}`);
  if (qHeadings < 2) fails.push(`qH=${qHeadings}`);
  if (numbers < 3) fails.push(`numbers=${numbers}`);
  if (bofuLinks < 1) fails.push(`bofu=${bofuLinks}`);
  if (bolds < 2) fails.push(`bolds=${bolds}`);
  if (!hasCta) fails.push("no CTA");
  if (!nameMention) fails.push("no name");
  if (title.trim().length <= 10) fails.push("short title");
  if (internalLinks < 4) fails.push(`links=${internalLinks}`);
  if (hasForbidden) fails.push("forbidden pattern");

  if (fails.length) {
    allOk = false;
    console.log(`✗ ${slug}: ${fails.join(" | ")}`);
  } else {
    console.log(`✔ ${slug} (${words} کلمه، پاسخ ${answerWords}w، FAQ ${faqCount}، لینک ${internalLinks})`);
  }
}
console.log(allOk ? "\nهمه گیت‌ها پاس شد — انتشار امن است" : "\n⚠ گیت‌های رد شده وجود دارد");
process.exit(allOk ? 0 : 1);
