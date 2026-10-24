#!/usr/bin/env node
/* ============================================================
   Bing Webmaster — ارسال تک‌به‌تک URLها برای ایندکس
   (کلید API از .bing-api-key — گیت‌ایگنور)

   اجرا:
     node scripts/bing-submit-urls.mjs                 # همه URLهای سitemap، دونه‌دونه
     node scripts/bing-submit-urls.mjs --sitemap-only  # فقط ثبت سitemap
     node scripts/bing-submit-urls.mjs --quota         # فقط نمایش سهمیه
     node scripts/bing-submit-urls.mjs --errors        # خطاهای خزش (GetCrawlIssues)
     node scripts/bing-submit-urls.mjs <url> [url...]  # URLهای مشخص

   سهمیه معمول: ~۱۰۰/روز (GET GetUrlSubmissionQuota چک می‌شود)
   مستندات: learn.microsoft.com/bingwebmaster
   ============================================================ */

import { readFileSync } from "node:fs";

const KEY = readFileSync("/home/z/my-project/.bing-api-key", "utf8").trim();
const SITE = "https://dr-kermani.com";
const BASE = "https://ssl.bing.com/webmaster/api.svc/json";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, params = {}, body = null) {
  const qs = new URLSearchParams({ apikey: KEY, ...params });
  const res = await fetch(`${BASE}/${method}?${qs}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json; charset=utf-8" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, ok: res.ok, json, text };
}

async function getUrls() {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

/* ---------- حالت‌ها ---------- */
const args = process.argv.slice(2);

// سهمیه
if (args.includes("--quota")) {
  const r = await api("GetUrlSubmissionQuota", { siteUrl: SITE });
  console.log("Quota:", JSON.stringify(r.json?.d ?? r.text));
  process.exit(0);
}

// خطاهای خزش
if (args.includes("--errors")) {
  const r = await api("GetCrawlIssues", { siteUrl: SITE });
  const issues = r.json?.d ?? [];
  if (!Array.isArray(issues) || !issues.length) {
    console.log("✅ هیچ خطای خزشی ثبت نشده (یا هنوز داده‌ای نیست)");
  } else {
    for (const i of issues) console.log(`• ${i.IssueType ?? "?"} | ${i.Url ?? ""} | ${i.DiscoveryDate ?? ""}`);
  }
  process.exit(0);
}

// ثبت سitemap
if (args.includes("--sitemap-only")) {
  const r = await api("SubmitSitemap", {}, { siteUrl: SITE, feedUrl: `${SITE}/sitemap.xml` });
  console.log(`SubmitSitemap → HTTP ${r.status}`, r.json?.d ?? r.text.slice(0, 200));
  process.exit(r.ok ? 0 : 1);
}

/* ---------- ارسال تک‌به‌تک ---------- */
let urls;
const explicit = args.filter((a) => !a.startsWith("--"));
if (explicit.length) urls = explicit;
else urls = await getUrls();

// سهمیه را بگیر
const q = await api("GetUrlSubmissionQuota", { siteUrl: SITE });
const daily = q.json?.d?.DailyQuota;
console.log(`سهمیه باقی‌مانده امروز: ${daily} | درخواست برای: ${urls.length} URL`);
if (typeof daily === "number" && urls.length > daily) {
  console.log(`⚠️ فقط ${daily} URL ارسال می‌شود (سهمیه روزانه)`);
  urls = urls.slice(0, daily);
}

let ok = 0, fail = 0;
for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const r = await api("SubmitUrl", {}, { siteUrl: SITE, url });
  const good = r.status === 200;
  if (good) ok++; else fail++;
  console.log(`[${i + 1}/${urls.length}] ${good ? "✅" : "❌ HTTP " + r.status} ${url}${good ? "" : " — " + r.text.slice(0, 120)}`);
  await sleep(250); // ادب در برابر API
}
console.log(`\n=== نتیجه: ${ok} موفق / ${fail} ناموفق ===`);
