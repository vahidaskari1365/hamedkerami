#!/usr/bin/env node
/* راستی‌آزمایی زنده نهایی موج ۲ — از صفحات HTML (force-dynamic، بدون کش) */
const SITE = "https://dr-kermani.com";
const kwmap = {
  "jaw-surgery-signs": "علائم نیاز به جراحی فک",
  "jaw-surgery-consultation-checklist": "مشاوره جراحی فک",
  "bimax-surgery-cost-1405": "هزینه جراحی دو فک ۱۴۰۵",
  "jaw-surgery-statistics": "آمار جراحی فک",
  "jaw-surgery-recovery-care": "مراقبت بعد از جراحی فک",
  "blepharoplasty-cost-1405": "هزینه بلفاروپلاستی ۱۴۰۵",
  "jaw-surgery-pain": "درد بعد از جراحی فک",
  "implant-vs-bridge": "ایمپلنت یا بریج",
  "jaw-surgery-before-after": "جراحی فک قبل و بعد",
  "jaw-asymmetry": "نامتقارنی فک",
};
function norm(s) {
  return s.replace(/[\u064B-\u0652\u0670]/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک")
    .replace(/\u200c/g, " ").replace(/\s+/g, " ").toLowerCase();
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const rows = [];
async function fetchRetry(url, tries = 5) {
  for (let t = 1; t <= tries; t++) {
    try {
      const bust = url + (url.includes("?") ? "&" : "?") + "_cb=" + Date.now();
      return await fetch(bust, { signal: AbortSignal.timeout(25000), headers: { "Cache-Control": "no-cache" } }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      });
    } catch (e) {
      if (t === tries) throw e;
      await sleep(3000 * t);
    }
  }
}
for (const [slug, kw] of Object.entries(kwmap)) {
  try {
    const html = await fetchRetry(`${SITE}/blog/${slug}`);
    const ogTitle = (html.match(/<meta property="og:title" content="([^"]*)"/u) || [])[1] || "";
    const desc = (html.match(/<meta name="description" content="([^"]*)"/u) || html.match(/<meta property="og:description" content="([^"]*)"/u) || [])[1] || "";
    const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/u) || [])[1] || "").replace(/<[^>]+>/g, "").trim();
    const text = norm(html.replace(/<[^>]+>/g, " "));
    const freqPage = (text.match(new RegExp(esc(norm(kw)), "g")) || []).length;
    const tOk = norm(ogTitle).startsWith(norm(kw));
    const h1Ok = norm(h1).includes(norm(kw));
    const dOk = norm(desc).includes(norm(kw));
    const ok = tOk && h1Ok && dOk && freqPage >= 2;
    rows.push({ slug, ok });
    console.log(`${ok ? "✓" : "⚠"} ${slug}`);
    console.log(`   og:title(${tOk ? "✓" : "✗"}): ${ogTitle.slice(0, 62)}`);
    console.log(`   H1(${h1Ok ? "✓" : "✗"}): ${h1.slice(0, 62)}`);
    console.log(`   متا(${dOk ? "✓" : "✗"}): ${desc.slice(0, 66)}`);
    console.log(`   فراوانی مرئی صفحه: ${freqPage}`);
  } catch (e) {
    rows.push({ slug, ok: false });
    console.log(`✗ ${slug} — ${e.message}`);
  }
  await sleep(1200);
}
const pass = rows.filter((r) => r.ok).length;
console.log(`\nجمع: ${pass}/10 کامل`);
process.exit(pass === 10 ? 0 : 2);
