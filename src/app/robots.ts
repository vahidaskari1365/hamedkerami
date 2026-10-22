import type { MetadataRoute } from "next";
import { SITE } from "@/lib/data";

/* ============================================================
   robots.txt داینامیک — منبع واحد: SITE.url در lib/data.ts
   - مسیرهای ادمین و API از ایندکس گوگل خارج
   - ربات‌های AI (GEO/AEO) اجازه کامل دارند
   - آدرس سایت‌مپ داینامیک (/sitemap.xml) معرفی می‌شود
   ============================================================ */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      /* ربات‌های موتورهای جستجو */
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      /* ربات‌های هوش مصنوعی — پیشنهاد شدن در پاسخ‌های AI
         (tier جستجو = استناد در پاسخ؛ طبق چارچوب geo-optimizer-skill) */
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      { userAgent: "Claude-User", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Google-CloudVertexBot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" },
      { userAgent: "Meta-ExternalFetcher", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "xAI-Bot", allow: "/" },
      { userAgent: "DuckAssistBot", allow: "/" },
      { userAgent: "YouBot", allow: "/" },
      { userAgent: "PetalBot", allow: "/" },
      { userAgent: "AI2Bot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
