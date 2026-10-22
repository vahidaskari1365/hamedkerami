import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";

/* ============================================================
   /api/agents/daily — کنترل ایجنت‌های بلاگ
   GET  → وضعیت (آخرین اجرا + نتیجه + تعداد مقالات ایجنت‌ها)
   POST → اجرای دستی (نیاز به لاگین ادمین یا هدر x-agent-key)
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
      schedule: "هر روز ۰۷:۰۰ تهران",
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
  const authed = (secret && key === secret) || (await isAdmin());
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { runDailyBlog } = await import("@/lib/agents/pipeline");
    const result = await runDailyBlog(true);
    return NextResponse.json({ started: true, result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
