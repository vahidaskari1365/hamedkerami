import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/site-content";
import { SITE } from "@/lib/data";

/* ============================================================
   /ai/service.json — توصیف ماشین‌خوان خدمات مطب برای ایجنت‌های AI
   (GEO/AIO — پیشنهاد geo-optimizer-skill).
   ============================================================ */

export const dynamic = "force-dynamic";

export async function GET() {
  const { services } = await getSiteContent();
  const body = {
    /* name + capabilities سطح اول — استاندارد geo-checklist.dev:
       geo-optimizer-skill فیلد ریشه name و آرایه capabilities را چک می‌کند */
    name: "دکتر حامد کرمانی — جراحی فک و صورت و ایمپلنت دندان",
    capabilities: [
      "جراحی ارتوگناتیک فک (یک فک و دو فک — بایمکس/مونومکس)",
      "جنیوپلاستی و جراحی چانه",
      "بلفاروپلاستی",
      "ایمپلنت دندان و ایمپلنت زایگوماتیک",
      "درمان اختلالات مفصل فک (TMD) و پروتز مفصل",
      "درمان آسیب‌ها و شکستگی فک و صورت",
      "مشاوره آنلاین و تفسیر عکس نیمرخ",
    ],
    provider: "دکتر حامد کرمانی",
    url: SITE.url,
    type: "MedicalClinic — Oral & Maxillofacial Surgery",
    telephone: SITE.phoneDisplay,
    whatsapp: SITE.whatsappDisplay,
    address: SITE.address,
    bookingUrl: `${SITE.url}/appointment`,
    services: services.map((s) => ({
      name: s.title,
      description: s.desc,
      url: `${SITE.url}/services`,
    })),
    languages: ["fa", "en"],
  };

  return new NextResponse(JSON.stringify(body, null, 1), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
