import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

/** خواندن همه‌ی تنظیمات (ادمین) */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  const rows = await db.setting.findMany();
  const settings: Record<string, unknown> = {};
  for (const r of rows) {
    try {
      settings[r.key] = JSON.parse(r.value);
    } catch {
      settings[r.key] = r.value;
    }
  }
  return NextResponse.json({ ok: true, settings });
}

/** ذخیره‌ی گروهی تنظیمات — بدنه: { key: object } */
export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const allowed = ["site", "hero", "about", "videos", "brand", "booking"];
    for (const [key, value] of Object.entries(body)) {
      if (!allowed.includes(key)) continue;
      if (typeof value !== "object" || value === null) continue;
      const serialized = JSON.stringify(value);
      /* سقف حجم هر گروه تنظیمات — جلوگیری از پرکردن دیتابیس */
      if (!serialized || serialized.length > 100 * 1024) continue;
      await db.setting.upsert({
        where: { key },
        create: { key, value: serialized },
        update: { value: serialized },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای ذخیره" }, { status: 500 });
  }
}
