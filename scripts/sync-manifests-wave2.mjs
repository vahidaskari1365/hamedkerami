#!/usr/bin/env node
/* همگام‌سازی title-manifest.json و meta-manifest.json با wave2.json — رکورد ماندگار */
import { readFileSync, writeFileSync } from "node:fs";

const wave2 = JSON.parse(readFileSync("content-fixes/wave2.json", "utf-8"));

/* ---- title-manifest: بروزرسانی/افزودن ورودی‌های دارای title ---- */
const tmPath = "content-fixes/title-manifest.json";
const tm = JSON.parse(readFileSync(tmPath, "utf-8"));
let tUp = 0, tAdd = 0;
for (const [slug, s] of Object.entries(wave2)) {
  if (slug.startsWith("_") || !s.title) continue;
  const prev = tm[slug];
  tm[slug] = prev?.excerpt ? { title: s.title, excerpt: prev.excerpt } : { title: s.title };
  if (prev) tUp++; else tAdd++;
}
writeFileSync(tmPath, JSON.stringify(tm, null, 2) + "\n");
console.log(`title-manifest: ${tUp} بروزرسانی، ${tAdd} افزودن → کل ${Object.keys(tm).length}`);

/* ---- meta-manifest: بروزرسانی/افزودن ورودی‌های دارای meta ---- */
const mmPath = "content-fixes/meta-manifest.json";
const mm = JSON.parse(readFileSync(mmPath, "utf-8"));
let mUp = 0, mAdd = 0;
for (const [slug, s] of Object.entries(wave2)) {
  if (slug.startsWith("_") || !s.meta) continue;
  if (mm[slug]) mUp++; else mAdd++;
  mm[slug] = s.meta;
}
writeFileSync(mmPath, JSON.stringify(mm, null, 2) + "\n");
console.log(`meta-manifest: ${mUp} بروزرسانی، ${mAdd} افزودن → کل ${Object.keys(mm).length}`);
