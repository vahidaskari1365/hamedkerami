#!/usr/bin/env node
/* بررسی زنده تایتل/متا/H1 ده مقاله رد باقی‌مانده — خروجی: audit/live10.json */
import { writeFileSync } from "node:fs";

const SITE = "https://dr-kermani.com";
const slugs = [
  "jaw-surgery-signs",
  "jaw-surgery-consultation-checklist",
  "bimax-surgery-cost-1405",
  "jaw-surgery-statistics",
  "jaw-surgery-recovery-care",
  "blepharoplasty-cost-1405",
  "jaw-surgery-pain",
  "implant-vs-bridge",
  "jaw-asymmetry",
  "jaw-surgery-before-after",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchRetry(url, tries = 4) {
  for (let t = 1; t <= tries; t++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (t === tries) throw e;
      await sleep(2500 * t);
    }
  }
}

const out = {};
for (const slug of slugs) {
  try {
    const html = await fetchRetry(`${SITE}/blog/${slug}`);
    const title = (html.match(/<title>([^<]*)<\/title>/u) || [])[1] || "";
    const desc = (html.match(/<meta name="description" content="([^"]*)"/u) || html.match(/<meta property="og:description" content="([^"]*)"/u) || [])[1] || "";
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/u) || [])[1]?.replace(/<[^>]+>/g, "").trim() || "";
    const hasKwBlock = html.includes("کلیدواژه‌ها");
    out[slug] = { title: title.trim(), desc: desc.trim(), h1, hasKwBlock, len: { title: title.trim().length, desc: desc.trim().length } };
    console.log(`✓ ${slug} | title(${title.trim().length}): ${title.trim().slice(0, 55)}`);
    console.log(`   meta(${desc.trim().length}): ${desc.trim().slice(0, 70)}`);
  } catch (e) {
    out[slug] = { error: String(e.message || e) };
    console.log(`✗ ${slug} — ${e.message || e}`);
  }
  await sleep(1500);
}
writeFileSync("audit/live10.json", JSON.stringify(out, null, 2));
console.log("\nذخیره شد: audit/live10.json");
