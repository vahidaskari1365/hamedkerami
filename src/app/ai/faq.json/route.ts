import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/site-content";
import { SITE } from "@/lib/data";

/* ============================================================
   /ai/faq.json — پرسش‌های پرتکرار سایت به‌صورت ساخت‌یافته برای
   موتورهای پاسخ‌محور (GEO/AEO — پیشنهاد geo-optimizer-skill).
   FAQ از دیتابیس خوانده می‌شود و با پنل ادمین به‌روز می‌شود.
   ============================================================ */

export const dynamic = "force-dynamic";

export async function GET() {
  const { faq } = await getSiteContent();
  const body = {
    site: SITE.url,
    language: "fa-IR",
    entity: "دکتر حامد کرمانی — متخصص جراحی فک و صورت",
    faqs: faq.map((f) => ({ question: f.q, answer: f.a })),
    disclaimer:
      "پاسخ‌ها جنبه آموزشی دارند و جایگزین معاینه حضوری نیستند؛ برای تشخیص دقیق با مطب تماس بگیرید.",
  };

  return new NextResponse(JSON.stringify(body, null, 1), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
