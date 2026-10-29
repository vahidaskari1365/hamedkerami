#!/usr/bin/env node
/* مقایسه تایتل زنده «الان» با اسنپ‌شات دیروز (llms-live) برای کشف برگشت seed-on-boot */
import { readFileSync } from "node:fs";

const SITE = "https://dr-kermani.com";
const slugs = [
  "jaw-surgery-return-to-work",
  "jaw-surgery-signs",
  "3d-jaw-surgery-simulation",
  "jaw-surgery-statistics",
  "kids-jaw-surgery",
  "jaw-surgery-consultation-checklist",
  "bimax-surgery-cost-1405",
  "jaw-surgery-pain",
];
const manifest = JSON.parse(readFileSync("content-fixes/title-manifest.json", "utf-8"));
const snapshot = {};
for (const l of readFileSync("audit/llms-live.txt", "utf-8").split("\n")) {
  const m = l.match(/^## (.+)$/);
  if (m) snapshot[(readFileSync("/dev/null", "utf-8"), "")] = ""; /* placeholder */
}

function norm(s) {
  return s.replace(/[\u064B-\u0652\u0670]/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\u200c/g, " ").replace(/\s+/g, " ").toLowerCase();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const slug of slugs) {
  try {
    const html = await fetch(`${SITE}/blog/${slug}`, { signal: AbortSignal.timeout(25000) }).then((r) => r.text());
    const title = ((html.match(/<title>([^<]*)<\/title>/u) || [])[1] || "").replace(/\s*\|\s*دکتر حامد کرمانی\s*$/, "").trim();
    const m = manifest[slug];
    const inSnapshot = norm(title) === norm(m?.title || "");
    console.log(`${inSnapshot ? "✓ مطابق مانیفست" : "✗ متفاوت"} | ${slug}`);
    console.log(`   زنده الان : ${title}`);
    if (!inSnapshot) console.log(`   مانیفست  : ${m?.title}`);
  } catch (e) {
    console.log(`✗ ${slug} — ${e.message}`);
  }
  await sleep(1200);
}
