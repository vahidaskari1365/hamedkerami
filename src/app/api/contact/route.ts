import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/auth";

const contactSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد").max(120),
  email: z.string().email("ایمیل معتبر نیست").max(200),
  subject: z.string().min(2).max(200),
  message: z.string().max(4000).optional().nullable(),
  /* تله‌ی ربات — در فرم مخفی است؛ ربات‌ها آن را پر می‌کنند.
     سخت‌گیری روی این فیلد اعمال نمی‌شود تا پاسخ ربات‌ها با کاربر عادی فرق نکند */
  website: z.string().max(300).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  /* حداکثر ۵ پیام در ۱۰ دقیقه از هر IP */
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "تعداد پیام‌ها زیاد است — کمی بعد دوباره تلاش کنید" },
      { status: 429 }
    );
  }
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "اطلاعات وارد شده معتبر نیست", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    /* ربات فیلد مخفی را پر کرده — با پاسخ موفق بی‌صدا رد می‌شود و چیزی ذخیره نمی‌شود */
    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }
    await db.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message ?? null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
