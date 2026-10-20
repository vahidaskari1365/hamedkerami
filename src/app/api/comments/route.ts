import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/auth";

/* ============================================================
   نظرات مقاله‌ها — API عمومی
   GET  ?slug=…  → فقط نظرهای تأییدشده (مدیریت در پنل ادمین)
   POST          → ثبت نظر جدید با status=approved:false (بازبینی دستی)
   ============================================================ */

const slugSchema = z.string().regex(/^[a-z0-9-]{1,120}$/, "مقاله نامعتبر است");

const commentSchema = z.object({
  slug: slugSchema,
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد").max(80),
  body: z
    .string()
    .min(5, "متن نظر خیلی کوتاه است")
    .max(2000, "متن نظر حداکثر ۲۰۰۰ حرف است"),
  /* تله‌ی ربات — فیلد مخفی فرم */
  website: z.string().max(300).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const check = slugSchema.safeParse(slug);
  if (!check.success) {
    return NextResponse.json({ ok: false, error: "مقاله نامعتبر است" }, { status: 400 });
  }
  try {
    const rows = await db.articleComment.findMany({
      where: { slug, approved: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, body: true, createdAt: true },
      take: 50,
    });
    return NextResponse.json({ ok: true, rows });
  } catch {
    return NextResponse.json({ ok: false, rows: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  /* حداکثر ۳ نظر در ۱۰ دقیقه از هر IP */
  if (!rateLimit(`comments:${ip}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "تعداد ارسال‌ها زیاد است — کمی بعد دوباره تلاش کنید" },
      { status: 429 },
    );
  }
  try {
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست";
      return NextResponse.json({ ok: false, error: first }, { status: 400 });
    }
    /* ربات فیلد مخفی را پر کرده — پاسخ موفق بی‌صدا، بدون ذخیره */
    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }
    await db.articleComment.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        body: parsed.data.body,
        approved: false,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
