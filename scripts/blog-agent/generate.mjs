/* ============================================================
   blog-agent — انتشار روزانه ۱۰ مقاله (۰۷:۰۰ تهران)
   دو منبع محتوا به ترتیب:
   ۱) مخزن مقالات آماده (content-queue/pool/<slug>.json) — مقالات
      دست‌نویس تاییدشده؛ در رانر گیت‌هاب بدون نیاز به API هوش مصنوعی
      منتشر می‌شوند (خروجی شبکه هاست/رانر به internal-api.z.ai بسته است)
   ۲) تولید زنده با ۵ ایجنت (src/lib/agents/creative.ts) — فقط وقتی
      کانفیگ SDK در دسترس باشد (مثلاً محیط توسعه)
   انتشار: POST /api/agents/publish → سردبیر QC + یکتایی روی سرور
   → سایت‌مپ و llms.txt داینامیک خودکار به‌روز می‌شوند
   اجرا: bun scripts/blog-agent/generate.mjs
   ============================================================ */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const SITE_URL = process.env.SITE_URL || "https://dr-kermani.com";
const AGENT_KEY = process.env.AGENT_SECRET || "";
const ROOT = path.resolve(import.meta.dir, "../..");
const POOL_DIR = path.join(ROOT, "content-queue", "pool");

if (!AGENT_KEY) throw new Error("AGENT_SECRET در env نیست");

async function api(pathname, method = "GET", body = null) {
  const res = await fetch(`${SITE_URL}/api/agents${pathname}`, {
    method,
    headers: { "x-agent-key": AGENT_KEY, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 300) }; }
  return { ok: res.ok, status: res.status, json };
}

function parsePoolMd(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { title: meta.title, excerpt: meta.excerpt, cover: meta.cover, body: m[2].trim() };
}

function poolArticleFor(slug) {
  for (const ext of [".md", ".json"]) {
    const f = path.join(POOL_DIR, `${slug}${ext}`);
    if (!existsSync(f)) continue;
    try {
      const raw = readFileSync(f, "utf8");
      const a = ext === ".md" ? parsePoolMd(raw) : JSON.parse(raw);
      if (a?.slug !== false && a?.title && a?.body) return a;
    } catch { /* خراب — نادیده */ }
  }
  return null;
}

function poolRemaining() {
  try { return readdirSync(POOL_DIR).filter((f) => f.endsWith(".md") || f.endsWith(".json")).length; }
  catch { return 0; }
}

/* تولید زنده — فقط با کانفیگ معتبر SDK (در رانر گیت‌هاب موجود نیست) */
async function liveGenerate(topic) {
  const { strategistAgent, writerAgent, seoAgent, imageAgentBase64 } = await import("@/lib/agents/creative");
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  const zai = await ZAI.create();
  let brief;
  try {
    brief = await strategistAgent(zai, topic);
    console.log(`[runner] ✓ استراتژیست — ${brief.outline.length} بخش`);
  } catch (e) {
    console.error("[runner] استراتژیست fallback:", e.message);
    brief = {
      angle: topic.keyword,
      outline: [topic.title, "چه کسانی کاندید هستند", "مراحل و هزینه", "پرسش های پرتکرار"],
      paaQuestions: [`${topic.keyword} چیست و برای چه کسانی مناسب است؟`, "هزینه آن چقدر است؟", "عوارض آن چیست؟", "دوره ریکاوری چقدر است؟"],
      internalLinks: [{ anchor: "خدمات دکتر کرمانی", href: topic.landing }],
      stats: ["بیش از ۱۲۰۰ جراحی فک و صورت توسط دکتر حامد کرمانی انجام شده است"],
    };
  }
  const body = await writerAgent(zai, topic, brief);
  console.log(`[runner] ✓ نویسنده — ${body.length} کاراکتر`);
  const optimized = await seoAgent(zai, topic, { title: topic.title, body });
  console.log(`[runner] ✓ سئوکار — ${optimized.title}`);
  const coverBase64 = await imageAgentBase64(topic);
  console.log(`[runner] ✓ تصویرساز ۳D — ${coverBase64 ? Math.round(coverBase64.length / 1024) + "KB" : "fallback"}`);
  return { title: optimized.title, excerpt: optimized.excerpt, body: optimized.body, coverBase64 };
}

async function main() {
  const q = await api("/queue");
  if (!q.ok) throw new Error(`GET /queue → HTTP ${q.status}: ${JSON.stringify(q.json).slice(0, 200)}`);
  console.log(`[runner] منتشرشده: ${q.json.totalPublished} | صف: ${q.json.pending.map((t) => t.title).join(" | ")}`);
  if (!q.json.pending.length) {
    console.log("[runner] صف ۲۴ مقاله‌ای تمام شد — evergreen/به‌روزرسانی سالانه در topics.ts");
    return;
  }

  const results = [];
  for (const topic of q.json.pending.slice(0, 16)) {
    console.log(`\n[runner] === ${topic.title} ===`);
    try {
      const pooled = poolArticleFor(topic.slug);
      let payload;
      if (pooled) {
        console.log(`[runner] ✓ منبع: مخزن آماده (${path.basename(POOL_DIR)}/${topic.slug}.json) | باقی‌مانده: ${poolRemaining()}`);
        payload = {
          slug: topic.slug,
          title: pooled.title || topic.title,
          excerpt: pooled.excerpt || topic.brief.slice(0, 150),
          body: pooled.body,
          keyword: topic.keyword,
          cover: pooled.cover || "",
        };
      } else {
        console.log("[runner] مخزن آماده ندارد → تلاش برای تولید زنده ۵ ایجنت…");
        const gen = await liveGenerate(topic);
        payload = { slug: topic.slug, title: gen.title, excerpt: gen.excerpt, body: gen.body, keyword: topic.keyword, coverBase64: gen.coverBase64 };
      }
      const pub = await api("/publish", "POST", payload);
      console.log(`[runner] ${pub.json.ok ? "✓ منتشر شد" : "✗ رد شد"} (HTTP ${pub.status}) — ${pub.json.reason || pub.json.error || ""}`);
      results.push({ topic: topic.title, ...pub.json });
    } catch (e) {
      console.error(`[runner] ✗ «${topic.title}» ناموفق:`, e.message);
      results.push({ topic: topic.title, ok: false, reason: e.message });
    }
  }

  const ok = results.filter((r) => r.ok).length;
  console.log(`\n[runner] نتیجه روز: ${ok}/${results.length} منتشر شد | مخزن آماده باقی‌مانده: ${poolRemaining()}`);
  if (ok === 0 && results.length > 0) process.exit(1);
}

main().catch((e) => {
  console.error("[runner] fatal:", e.message);
  process.exit(1);
});
