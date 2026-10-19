import { db } from "@/lib/db";
import { LANDING_DEFAULTS, type LandingData } from "./landing-defaults";

/* ============================================================
   خواندن صفحه فرود از دیتابیس با fallback به محتوای پیش‌فرض
   اگر رکورد موجود باشد و منتشر نشده باشد → null (404)
   ============================================================ */

export const LANDING_URLS: Record<string, string> = {
  "jaw-surgery": "https://dr-kermani.com/jaw-surgery",
  "chin-surgery": "https://dr-kermani.com/chin-surgery",
  "dental-implant": "https://dr-kermani.com/dental-implant",
  "implant-pasdaran": "https://dr-kermani.com/implant-pasdaran",
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getLanding(slug: string): Promise<LandingData | null> {
  const fb = LANDING_DEFAULTS[slug] ?? null;
  try {
    const row = await db.landingPage.findUnique({ where: { slug } });
    if (!row) return fb;
    if (!row.published) return null; // مدیر خاموش کرده → 404
    return {
      slug: row.slug,
      label: row.label,
      metaTitle: row.metaTitle || fb?.metaTitle || "",
      metaDescription: row.metaDescription || fb?.metaDescription || "",
      keywords: parseJson<string[]>(row.keywords, fb?.keywords ?? []),
      eyebrow: row.eyebrow,
      h1: row.h1,
      heroDesc: row.heroDesc,
      heroImage: row.heroImage || fb?.heroImage || "",
      heroImageAlt: row.heroImageAlt,
      sections: parseJson<LandingData["sections"]>(row.sections, fb?.sections ?? []),
      ctaTitle: row.ctaTitle,
      ctaDesc: row.ctaDesc,
      faqs: parseJson<LandingData["faqs"]>(row.faqs, fb?.faqs ?? []),
      related: parseJson<LandingData["related"]>(row.related, fb?.related ?? []),
    };
  } catch {
    return fb;
  }
}

/** لوگوی برند از تنظیمات — برای هدر صفحات فرود (سرور رندر) */
export async function getBrandLogo(): Promise<string> {
  try {
    const row = await db.setting.findUnique({ where: { key: "brand" } });
    if (!row) return "/images/logo.png";
    const brand = parseJson<{ logoImage?: string }>(row.value, {});
    return brand.logoImage || "/images/logo.png";
  } catch {
    return "/images/logo.png";
  }
}
