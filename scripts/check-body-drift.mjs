#!/usr/bin/env node
/* بررسی رانش content-fixes/<slug>.md نسبت به بدنه زنده llms-live.txt */
import { readdirSync, readFileSync } from "node:fs";

function norm(s) {
  return s.replace(/\s+/g, " ").trim();
}
function parseLlms(text) {
  const lines = text.split("\n");
  const out = {};
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ") && lines[i + 1] && lines[i + 1].startsWith("آدرس:")) {
      if (cur) out[cur.slug] = cur.body.join("\n").trim();
      cur = { slug: (lines[i + 1].match(/blog\/([^\/\s]+)$/) || [])[1] || "", body: [], started: false };
      i++; continue;
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
function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? m[2] : raw;
}

const live = parseLlms(readFileSync("audit/llms-live.txt", "utf-8"));
const files = readdirSync("content-fixes").filter((f) => f.endsWith(".md"));
let same = 0, drift = [], missing = [];
for (const f of files) {
  const slug = f.replace(/\.md$/, "");
  const mdBody = norm(splitFrontmatter(readFileSync(`content-fixes/${f}`, "utf-8")));
  const lv = live[slug];
  if (!lv) { missing.push(slug); continue; }
  if (norm(lv) === mdBody) same++;
  else drift.push({ slug, mdLen: mdBody.length, liveLen: norm(lv).length });
}
console.log(`فایل: ${files.length} | یکسان با زنده: ${same} | رانش: ${drift.length} | غایب در زنده: ${missing.length}`);
if (drift.length) { console.log("\nرانش:"); for (const d of drift) console.log(`  ${d.slug} — md:${d.mdLen} live:${d.liveLen} (اختلاف ${d.liveLen - d.mdLen})`); }
if (missing.length) console.log("\nغایب:", missing.join(", "));
