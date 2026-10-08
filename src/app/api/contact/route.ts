import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد").max(120),
  email: z.string().email("ایمیل معتبر نیست").max(200),
  subject: z.string().min(2).max(200),
  message: z.string().max(4000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "اطلاعات وارد شده معتبر نیست", details: parsed.error.flatten() },
        { status: 400 }
      );
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
