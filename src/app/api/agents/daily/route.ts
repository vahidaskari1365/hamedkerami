import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";
import { isBusy } from "@/lib/agents/pipeline";

/* ============================================================
   /api/agents/daily — کنترل ایجنت‌های بلاگ (روزی ۲ مقاله، ۰۷:۰۰ تهران)
   GET  → وضعیت (آخرین اجرا + نتیجه + تعداد مقالات ایجنت‌ها)
   POST → تریگر اجرا (زمان‌بند گیت‌هاب با هدر x-agent-key یا ادمین)
          پاسخ ۲۰۲ فوری برمی‌گردد و پایپ‌لاین در پس‌زمینه اجرا می‌شود
          (نتیجه از GET یا دیتابیس قابل پیگیری است)
   ============================================================ */

export const dynamic = "force-dynamic";

async function isAdmin(): Promise<boolean> {
  try {
    const c = await cookies();
    if (c.get(SESSION_COOKIE)?.value) return true;
  } catch { /* ignore */ }
  return false;
}

export async function GET() {
  try {
    const [lastRun, lastResult, lastError, count] = await Promise.all([
      db.setting.findUnique({ where: { key: "agents_last_run_date" } }),
      db.setting.findUnique({ where: { key: "agents_last_result" } }),
      db.setting.findUnique({ where: { key: "agents_last_error" } }),
      db.blogPost.count(),
    ]);
    let result: unknown = null;
    try {
      result = lastResult ? JSON.parse(lastResult.value) : null;
    } catch {
      result = lastResult?.value ?? null;
    }
    let error: unknown = null;
    try {
      error = lastError ? JSON.parse(lastError.value) : null;
    } catch {
      error = lastError?.value ?? null;
    }
    return NextResponse.json({
      enabled: true,
      schedule: "هر روز ۰۷:۰۰ تهران — روزی ۲ مقاله به ترتیب صف",
      busy: isBusy(),
      lastRunDate: lastRun?.value ?? null,
      lastResult: result,
      lastError: error,
      totalPosts: count,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const key = req.headers.get("x-agent-key");
  const secret = process.env.AGENT_SECRET || "";
  const isAdminUser = await isAdmin();
  const authed = (secret && key === secret) || isAdminUser;
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (isBusy()) {
    return NextResponse.json({ started: false, reason: "اجرای قبلی هنوز در جریان است" }, { status: 202 });
  }
  /* اجرای پس‌زمینه — تریگر گیت‌هاب منتظر اتمام نمی‌ماند (تایم‌اوت HTTP
     و کشتن پروسه توسط Passenger روی پایپ‌لاین چنددقیقه‌ای اثر ندارد)؛
     قفل روزانه در خود پایپ‌لاین (قبل از شروع) ثبت می‌شود.
     اجرای ادمین = force؛ اجرای تریگر = با رعایت قفل روزانه */
  const force = isAdminUser;
  void (async () => {
    try {
      const { runDailyBlog } = await import("@/lib/agents/pipeline");
      const result = await runDailyBlog(force);
      console.log("[agents/daily] اجرای پس‌زمینه تمام شد:", JSON.stringify(result).slice(0, 400));
    } catch (e) {
      console.error("[agents/daily] اجرای پس‌زمینه ناموفق:", (e as Error).message);
    }
  })();
  return NextResponse.json({ started: true, mode: "background", force }, { status: 202 });
}
