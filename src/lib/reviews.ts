import { db } from "@/lib/db";

/* ============================================================
   نظرات بیماران — زیرساخت بلوک اعتماد صفحات فرود + Review schema
   منبع: ردیف‌های تأییدشده جدول نظرات با اسلاگ اختصاصی
   «patient-reviews» — توسط تیم مطب از بازخورد واقعی بیماران
   (واتساپ/اینستاگرام با رضایت بیمار) در پنل ادمین ثبت می‌شود.
   هیچ محتوای جعلی تولید نمی‌شود؛ بدون رکورد، بلوک و اسکیما رندر
   نمی‌شوند.
   ============================================================ */

export const PATIENT_REVIEWS_SLUG = "patient-reviews";

export interface PatientReview {
  id: number;
  name: string;
  body: string;
  /** ISO — برای schema */
  date: string;
}

export async function getPatientReviews(take = 8): Promise<PatientReview[]> {
  try {
    const rows = await db.articleComment.findMany({
      where: { slug: PATIENT_REVIEWS_SLUG, approved: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, body: true, createdAt: true },
      take,
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      body: r.body,
      date: r.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

/** متن کوتاه‌شده برای کارت نمایش — برش در مرز کلمه */
export function trimReviewBody(body: string, max = 320): string {
  const clean = body.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}
