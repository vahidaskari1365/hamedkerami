import { NextRequest, NextResponse } from "next/server";
import { ensureBookingSchema } from "@/lib/booking/schema-guard";
import { buildSchedule } from "@/lib/booking/schedule";
import { localIsoDay, tehranToday } from "@/lib/jalali";

/* ============================================================
   تقویم نوبت‌دهی — برنامه روزها + ظرفیت باقی‌مانده هر بازه
   GET /api/appointment/schedule?from=2026-11-01&days=42
   ============================================================ */

export async function GET(req: NextRequest) {
  try {
    await ensureBookingSchema();

    const sp = req.nextUrl.searchParams;
    const fromRaw = sp.get("from") ?? localIsoDay(tehranToday());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fromRaw)) {
      return NextResponse.json({ ok: false, error: "پارامتر from نامعتبر است" }, { status: 400 });
    }
    const days = Math.min(75, Math.max(7, Number(sp.get("days")) || 42));

    const schedule = await buildSchedule(fromRaw, days);
    return NextResponse.json({ ok: true, ...schedule });
  } catch (e) {
    console.error("[appointment/schedule] failed:", (e as Error).message);
    return NextResponse.json({ ok: false, error: "خطای سرور" }, { status: 500 });
  }
}
