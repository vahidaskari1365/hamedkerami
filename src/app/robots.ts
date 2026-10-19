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
      /* ربات‌های هوش مصنوعی — پیشنهاد شدن در پاسخ‌های AI */
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
