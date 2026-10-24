#!/usr/bin/env node
/* ============================================================
   IndexNow Submit — ایندکس فوری صفحات در Bing (+ Seznam/Yandex/Yeah)
   پروتکل رسمی indexnow.org — بدون نیاز به پنل یا API key ابری.
   کلید در فایل عمومی public/<key>.txt تأیید می‌شود و
   Bing Webmaster Tools به‌طور خودکار آن را به پراپرتی سایت می‌چسباند.

   اجرا:
     node scripts/indexnow-submit.mjs                # همه URLهای سitemap
     node scripts/indexnow-submit.mjs <url1> <url2>  # فقط چند URL
     node scripts/indexnow-submit.mjs --updated      # فقط URLهای lastmod اخیر (۷۲ ساعت)

   نکته: سقف رایگان هر درخواست = ۱۰۰۰۰ URL؛ ما خیلی زیر سقفیم.
   ============================================================ */

import { readFileSync } from "node:fs";

const KEY_FILE = "/home/z/my-project/.indexnow-key";
const KEY = readFileSync(KEY_FILE, "utf8").trim();
const SITE = "https://dr-kermani.com";
const HOST = "dr-kermani.com";
const ENDPOINT = "https://api.indexnow.org/IndexNow";

const args = process.argv.slice(2);
const onlyUpdated = args.includes("--updated");

let urls;
if (args.filter((a) => !a.startsWith("--")).length) {
  urls = args.filter((a) => !a.startsWith("--"));
} else {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (onlyUpdated) {
    // URLهایی که lastmodشان تازه است (۷۲ ساعت اخیر)
    const blocks = xml.split("<url>").slice(1);
    const fresh = [];
    for (const b of blocks) {
      const loc = b.match(/<loc>([^<]+)<\/loc>/)?.[1];
      const lm = b.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
      if (loc && lm && Date.now() - new Date(lm).getTime() < 72 * 3600e3)
        fresh.push(loc);
    }
    urls = fresh;
  }
}

if (!urls.length) {
  console.log("URLی برای ارسال نیست.");
  process.exit(0);
}

// IndexNow: حداکثر ۱۰۰۰۰ URL در هر POST؛ ما راحتیم
const payload = {
  host: HOST,
  key: KEY,
  keyLocation: `${SITE}/${KEY}.txt`,
  urlList: urls,
};

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

console.log(`IndexNow → ${urls.length} URL | HTTP ${res.status} ${res.statusText}`);
if (res.status === 200 || res.status === 202) {
  console.log("✅ پذیرفته شد — Bing صف ایندکس را می‌گیرد (معمولاً چند دقیقه تا چند ساعت)");
} else {
  const t = await res.text();
  console.error("❌ پاسخ:", t.slice(0, 500));
  process.exit(1);
}
