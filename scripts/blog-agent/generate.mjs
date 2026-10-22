/* ============================================================
   blog-agent — تولید ۲ مقاله در رانر GitHub Actions
   چرا رانر؟ خروجی شبکه هاست اشتراکی به API هوش مصنوعی نامطمئن
   است (fetch failed)؛ رانر گیت‌هاب اینترنت کامل دارد و کلید SDK
   از secret گیت‌هاب ZAI_CONFIG_B64 می‌آید (همان کلیدی که سرور دارد).
   جریان: صف از سرور → ۵ ایجنت (کد مشترک src/lib/agents/creative.ts)
   → POST /api/agents/publish (سردبیر QC روی سرور) → سایت‌مپ خودکار
   اجرا: bun scripts/blog-agent/generate.mjs
   ============================================================ */

import { writeFileSync } from "node:fs";
import { strategistAgent, writerAgent, seoAgent, imageAgentBase64 } from "../src/lib/agents/creative.ts";
import ZAI from "z-ai-web-dev-sdk";

const SITE_URL = process.env.SITE_URL || "https://dr-kermani.com";
const AGENT_KEY = process.env.AGENT_SECRET || "";

if (!AGENT_KEY) throw new Error("AGENT_SECRET در env نیست");

async function api(path, method = "GET", body = null) {
  const res = await fetch(`${SITE_URL}/api/agents${path}`, {
    method,
    headers: { "x-agent-key": AGENT_KEY, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 300) }; }
  if (!res.ok) throw new Error(`${method} ${path} → HTTP ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  return json;
}

async function main() {
  /* ۱) صف از سرور — عناوین منتشرشده برای جلوگیری از تکرار */
  const queue = await api("/queue");
  console.log(`[runner] منتشرشده: ${queue.totalPublished} | صف: ${queue.pending.map((t) => t.title).join(" | ")}`);
  if (!queue.pending.length) {
    console.log("[runner] صف خالی است — کاری برای انجام نیست");
    return;
  }

  const zai = await ZAI.create();
  const results = [];

  for (const topic of queue.pending.slice(0, 2)) {
    console.log(`\n[runner] === ${topic.title} ===`);
    try {
      /* ۱) استراتژیست */
      let brief;
      try {
        brief = await strategistAgent(zai, topic);
        console.log(`[runner] ✓ استراتژیست — ${brief.outline.length} بخش`);
      } catch (e) {
        console.error("[runner] استراتژیست fallback:", e.message);
        brief = {
          angle: topic.keyword,
          outline: [topic.title, "چه کسانی کاندید هستند", "مراحل و هزینه", "پرسش های پرتکرار"],
          paaQuestions: [
            `${topic.keyword} چیست و برای چه کسانی مناسب است؟`,
            "هزینه آن چقدر است؟",
            "عوارض و ریسک‌های آن چیست؟",
            "دوره ریکاوری چقدر است؟",
          ],
          internalLinks: [{ anchor: "خدمات دکتر کرمانی", href: "/services" }],
          stats: ["بیش از ۱۲۰۰ جراحی فک و صورت توسط دکتر حامد کرمانی انجام شده است"],
        };
      }

      /* ۲) نویسنده */
      const body = await writerAgent(zai, topic, brief);
      console.log(`[runner] ✓ نویسنده — ${body.length} کاراکتر`);

      /* ۳) سئوکار */
      const optimized = await seoAgent(zai, topic, { title: topic.title, body });
      console.log(`[runner] ✓ سئوکار — ${optimized.title}`);

      /* ۴) تصویرساز ۳D */
      const coverBase64 = await imageAgentBase64(topic);
      console.log(`[runner] ✓ تصویرساز — ${coverBase64 ? Math.round(coverBase64.length / 1024) + "KB" : "fallback سرور"}`);

      /* ۵) انتشار روی سرور (QC + یکتایی آنجا انجام می‌شود) */
      const pub = await api("/publish", "POST", {
        slug: topic.slug,
        title: optimized.title,
        excerpt: optimized.excerpt,
        body: optimized.body,
        keyword: topic.keyword,
        coverBase64,
      });
      console.log(`[runner] ${pub.ok ? "✓ منتشر شد" : "✗ رد شد"} — ${pub.reason}`);
      results.push({ topic: topic.title, ...pub });
    } catch (e) {
      console.error(`[runner] ✗ «${topic.title}» ناموفق:`, e.message);
      results.push({ topic: topic.title, ok: false, reason: e.message });
    }
  }

  const ok = results.filter((r) => r.ok).length;
  console.log(`\n[runner] نتیجه روز: ${ok}/${results.length} منتشر شد`);
  if (ok === 0 && results.length > 0) process.exit(1);
  writeFileSync("agent-result.json", JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error("[runner] fatal:", e.message);
  process.exit(1);
});
