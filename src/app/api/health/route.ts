import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ============================================================
   /api/health — تشخیص سلامت دیتابیس (برای عیب‌یابی از راه دور)
   هاست اشتراکی SSH ندارد؛ اگر Prisma روی پروداکشن خطا بدهد،
   همین endpoint پیام خطای واقعی را نشان می‌دهد تا ریشه پیدا شود.
   مسیر کامل دیتابیس ماسک می‌شود؛ هیچ داده‌ای از جداول برنمی‌گردد.
   ============================================================ */
export const dynamic = "force-dynamic";

export async function GET() {
  const mask = (url: string | undefined) =>
    url ? url.replace(/(file:.*\/)([^/]+)$/, "$1…/$2") : "(تنظیم نشده)";

  const report: Record<string, unknown> = {
    ok: false,
    dbUrl: mask(process.env.DATABASE_URL),
    runtime: process.env.NEXT_RUNTIME ?? "unknown",
    time: new Date().toISOString(),
  };

  try {
    await db.$queryRawUnsafe("SELECT 1");
    report.select1 = "ok";
    try {
      report.blogPosts = await db.blogPost.count();
      report.pageViews = await db.pageView.count();
      report.ok = true;
    } catch (e) {
      report.queryError = (e as Error).message.slice(0, 400);
    }
  } catch (e) {
    report.connectionError = (e as Error).message.slice(0, 400);
  }

  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
