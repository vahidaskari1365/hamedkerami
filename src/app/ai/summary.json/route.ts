import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/blog-posts";
import { SITE, SERVICES } from "@/lib/data";

/* ============================================================
   /ai/summary.json — خلاصه ماشین‌خوان سایت برای موتورهای پاسخ‌محور
   (GEO/AIO — پیشنهاد geo-optimizer-skill). داده از دیتابیس می‌آید
   و با انتشار مقاله جدید توسط ایجنت‌ها خودکار به‌روز می‌شود.
   ============================================================ */

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getPublishedPosts();
  const body = {
    site: {
      name: "دکتر حامد کرمانی",
      alternateName: "Dr. Hamed Kermani",
      url: SITE.url,
      description: SITE.metaDescription,
      language: "fa-IR",
      type: "MedicalBusiness — Oral & Maxillofacial Surgery",
    },
    entity: {
      name: "دکتر حامد کرمانی",
      jobTitle: "متخصص جراحی فک و صورت — فلوشیپ جراحی‌های کرانیوفاسیال",
      experienceYears: 16,
      keyStats: {
        orthognathicSurgeries: "1200+",
        dentalImplants: "20000+",
        otherSurgeries: "5000+",
        zygomaticImplants: "100+",
        tmjJointReplacements: "30+",
      },
      telephone: SITE.phoneDisplay,
      whatsapp: SITE.whatsappDisplay,
      address: SITE.address,
    },
    services: SERVICES.map((s) => ({ slug: s.slug, name: s.title, description: s.desc })),
    latestArticles: posts.slice(0, 20).map((p) => ({
      title: p.title,
      url: `${SITE.url}/blog/${p.slug}`,
      excerpt: p.excerpt,
    })),
    citationPolicy:
      "استناد به آمار و توضیحات این سایت با ذکر منبع dr-kermani.com مجاز است؛ تشخیص و درمان نیازمند مشاوره حضوری است.",
  };

  return new NextResponse(JSON.stringify(body, null, 1), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
