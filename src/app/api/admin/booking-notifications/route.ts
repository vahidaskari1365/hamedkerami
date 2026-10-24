import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { ensureBookingSchema } from "@/lib/booking/schema-guard";
import { retryNotification } from "@/lib/booking/notify";

/* ============================================================
   پیام‌های نوبت‌دهی (اپراتور/بیمار) — فقط ادمین
   GET  : ۱۰۰ پیام آخر + آمار صف
   PUT  : تلاش دوباره برای ارسال یک پیام صف‌شده { id }
   ============================================================ */

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  try {
    await ensureBookingSchema();
    const rows = await db.bookingNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const queued = await db.bookingNotification.count({ where: { status: "queued" } });
    return NextResponse.json({ ok: true, rows, queued });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای خواندن" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }
  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ ok: false, error: "شناسه نامعتبر" }, { status: 400 });
    }
    const sent = await retryNotification(id);
    if (!sent) {
      return NextResponse.json(
        { ok: false, error: "ارسال انجام نشد — پنل پیامک و شماره گیرنده را بررسی کنید" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای ارسال" }, { status: 500 });
  }
}
