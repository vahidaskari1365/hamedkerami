#!/usr/bin/env node
/* ============================================================
   ممیزی لینک‌سازی داخلی — از داده زنده llms-full.txt
   خروجی: audit/internal-links.json + خلاصه کنسول
   سنجه‌ها به ازای هر مقاله:
     - outboundBlog: تعداد لینک به مقالات دیگر بلاگ
     - outboundLanding: تعداد لینک به صفحات خدمت/هزینه/درباره (non-blog)
     - inbound: چند مقاله دیگر به این مقاله لینک داده‌اند
   ============================================================ */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = process.argv[2] || "audit/llms-live.txt";
const text = readFileSync(SRC, "utf-8");

/* ---- پارس بخش‌های «## عنوان / آدرس: .../blog/slug» (الگوی fix-title-publish) ---- */
function parseLlmsBodies(t) {
  const lines = t.split("\n");
  const out = {};
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ") && lines[i + 1] && lines[i + 1].startsWith("آدرس:")) {
      if (cur) out[cur.slug] = { title: cur.title, body: cur.body.join("\n") };
      cur = {
        slug: (lines[i + 1].match(/blog\/([^\/\s]+)$/) || [])[1] || "",
        title: line.replace(/^##\s*/, ""),
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
  if (cur) out[cur.slug] = { title: cur.title, body: cur.body.join("\n") };
  return out;
}

const posts = parseLlmsBodies(text);
const slugs = Object.keys(posts);
const slugSet = new Set(slugs);

/* ---- شمارش لینک‌ها ---- */
const linkRe = /\[([^\]]*)\]\(([^)\s]+)\)/g;
const stats = {};
const inbound = {};
for (const s of slugs) inbound[s] = new Set();

for (const s of slugs) {
  const { title, body } = posts[s];
  let outBlog = 0, outLanding = 0;
  const targets = [];
  for (const m of body.matchAll(linkRe)) {
    const href = m[2];
    const blogMatch = href.match(/\/blog\/([^\/\s)#]+)/);
    if (blogMatch) {
      const t = blogMatch[1].replace(/\.html$/, "");
      if (t !== s && slugSet.has(t)) {
        outBlog++;
        inbound[t].add(s);
        targets.push(t);
      }
      continue;
    }
    /* لینک داخلی غیربلاگ: لندینگ خدمت، هزینه، درباره، گالری، EN */
    if (/dr-kermani\.com|^\/(?!\/)/.test(href)) {
      const path = href.replace(/^https?:\/\/dr-kermani\.com/, "").split(/[#?]/)[0];
      if (path && !/\.(png|jpg|jpeg|webp|pdf|svg)$/i.test(path)) {
        outLanding++;
        targets.push(path);
      }
    }
  }
  const words = body.split(/\s+/).length;
  stats[s] = { title, outboundBlog: outBlog, outboundLanding: outLanding, words, targets: [...new Set(targets)] };
}

/* ---- خلاصه ---- */
const arr = Object.entries(stats).map(([slug, v]) => ({ slug, ...v }));
const avgOut = (arr.reduce((a, b) => a + b.outboundBlog, 0) / arr.length).toFixed(1);
const avgIn = (slugs.length / Object.values(inbound).filter((s) => s.size > 0).length).toFixed(1);
const zeroOut = arr.filter((a) => a.outboundBlog === 0 && a.outboundLanding === 0);
const zeroIn = arr.filter((a) => inbound[a.slug].size === 0);
const landingOnly = arr.filter((a) => a.outboundBlog === 0 && a.outboundLanding > 0);

console.log(`مقالات پارس‌شده: ${slugs.length}`);
console.log(`میانگین لینک به مقالات دیگر: ${avgOut}`);
console.log(`لینک خروجی صفر (نه بلاگ نه لندینگ): ${zeroOut.length}`);
console.log(`فقط لینک لندینگ دارند (بدون لینک به مقاله): ${landingOnly.length}`);
console.log(`بدون هیچ لینک ورودی از مقالات: ${zeroIn.length}`);
console.log("\n--- ۱۵ مقاله ضعیف‌تر در لینک خروجی ---");
[...arr].sort((a, b) => a.outboundBlog + a.outboundLanding - (b.outboundBlog + b.outboundLanding)).slice(0, 15)
  .forEach((a) => console.log(`${String(a.outboundBlog).padStart(2)} بلاگ | ${String(a.outboundLanding).padStart(2)} لندینگ | ${a.slug}`));
console.log("\n--- ۱۵ مقاله با کمترین لینک ورودی ---");
[...arr].sort((a, b) => inbound[a.slug].size - inbound[b.slug].size).slice(0, 15)
  .forEach((a) => console.log(`${String(inbound[a.slug].size).padStart(2)} ورودی | ${a.slug}`));

writeFileSync("audit/internal-links.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: SRC,
  totalArticles: slugs.length,
  avgOutboundBlog: Number(avgOut),
  articles: arr.map((a) => ({ ...a, inboundCount: inbound[a.slug].size, inboundFrom: [...inbound[a.slug]] })),
}, null, 2));
console.log("\nذخیره شد: audit/internal-links.json");
