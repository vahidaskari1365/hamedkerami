import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ============================================================
   /api/health — تشخیص سلامت دیتابیس (برای عیب‌یابی از راه دور)
   هاست اشتراکی SSH ندارد؛ اگر Prisma روی پروداکشن خطا بدهد،
   همین endpoint پیام خطای واقعی را نشان می‌دهد تا ریشه پیدا شود.
   مسیر کامل دیتابیس ماسک می‌شود؛ هیچ داده‌ای از جداول برنمی‌گردد.

   ?network=1 → پروب شبکه خروجی (DNS + TLS + fetch) برای عیب‌یابی
   «fetch failed» ایجنت‌های بلاگ روی هاست ایران. اگر مقصدها در
   دسترس نباشند، پایپ‌لاین روزانه باید از جایی دیگر اجرا شود.
   ============================================================ */
export const dynamic = "force-dynamic";

async function probe(name: string, target: string, timeoutMs = 6000): Promise<Record<string, unknown>> {
  const started = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(target, {
      method: "HEAD",
      signal: ctrl.signal,
      headers: { "User-Agent": "kermani-health-probe/1.0" },
    });
    clearTimeout(timer);
    return { ok: true, status: res.status, ms: Date.now() - started };
  } catch (e) {
    const err = e as Error & { cause?: Error & { code?: string; message?: string } };
    const cause = err.cause;
    return {
      ok: false,
      ms: Date.now() - started,
      error: err.message.slice(0, 120),
      causeCode: cause?.code ?? null,
      causeMsg: cause?.message?.slice(0, 160) ?? null,
    };
  }
}

export async function GET(req: Request) {
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

  const wantNetwork = new URL(req.url).searchParams.get("network") === "1";
  if (wantNetwork) {
    report.network = {
      internalZai: await probe("internal-api.z.ai", "https://internal-api.z.ai/v1"),
      publicZai: await probe("api.z.ai", "https://api.z.ai"),
      baseline: await probe("www.cloudflare.com", "https://www.cloudflare.com"),
    };
  }

  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
