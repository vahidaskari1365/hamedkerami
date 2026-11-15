#!/usr/bin/env node
/* مقایسهٔ بدنهٔ زنده (llms-full.txt) با بدنهٔ مخزن (قبل از ویرایش من، از git HEAD)
   تا بازنویسی امن باشد — اگر تفاوت باشد، فیکس‌های زندهٔ ازدست‌رفته مژدگانی می‌شوند */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const slugs = [
  ["genioplasty-cost", "src/lib/articles/genioplasty-cost.ts"],
  ["jaw-surgery-complications", "src/lib/articles/jaw-surgery-complications.ts"],
  ["jaw-surgery-before-after", "src/lib/articles/jaw-surgery-before-after.ts"],
  ["best-jaw-surgeon-tehran", "src/lib/articles/best-jaw-surgeon-tehran.ts"],
];

function parseLlmsBodies(text) {
  const lines = text.split("\n");
  const out = {};
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ") && lines[i + 1] && lines[i + 1].startsWith("آدرس:")) {
      if (cur) out[cur.slug] = cur.body.join("\n").trim();
      cur = { slug: (lines[i + 1].match(/blog\/([^\/\s]+)$/) || [])[1] || "", body: [], started: false };
      i++;
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
  if (cur) out[cur.slug] = cur.body.join("\n").trim();
  return out;
}

function repoBody(file) {
  const src = readFileSync(file, "utf-8");
  const m = src.match(/body: `([\s\S]*)`,\n\};/);
  if (!m) throw new Error("body template literal یافت نشد: " + file);
  return m[1].trim();
}

function headBody(file) {
  const src = execSync(`git show HEAD:${file}`, { encoding: "utf-8", maxBuffer: 1024 * 1024 * 8 });
  const m = src.match(/body: `([\s\S]*)`,\n\};/);
  if (!m) throw new Error("HEAD body یافت نشد: " + file);
  return m[1].trim();
}

const llms = parseLlmsBodies(readFileSync("/tmp/live/llms-full.txt", "utf-8"));
for (const [slug, file] of slugs) {
  const live = llms[slug] || "";
  const head = headBody(file);
  const same = live === head ? "LIVE==HEAD" : `LIVE!=HEAD (live ${live.length}, head ${head.length})`;
  console.log(`${slug}: ${same}`);
}
