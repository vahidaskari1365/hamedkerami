import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";
import { nextTopic } from "@/lib/agents/topics";

/* ============================================================
   /api/agents/queue — وضعیت صف محتوایی (برای رانر گیت‌هاب)
   GET با هدر x-agent-key یا لاگین ادمین:
   → publishedTitles (جلوگیری از تکرار) + تا ۴ موضوع بعدی
   ============================================================ */

export const dynamic = "force-dynamic";

async function isAdmin(): Promise<boolean> {
  try {
    const c = await cookies();
    if (c.get(SESSION_COOKIE)?.value) return true;
  } catch { /* ignore */ }
  return false;
}

export async function GET(req: Request) {
  const key = req.headers.get("x-agent-key");
  const secret = process.env.AGENT_SECRET || "";
  if (!((secret && key === secret) || (await isAdmin()))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const existing = await db.blogPost.findMany({ select: { title: true, slug: true } });
    const taken = new Set(existing.map((p) => p.title));
    const pending: ReturnType<typeof nextTopic>[] = [];
    let cursor = [...existing.map((p) => p.title)];
    for (let i = 0; i < 4; i++) {
      const t = nextTopic(cursor);
      if (!t) break;
      pending.push(t);
      cursor.push(t.title);
    }
    return NextResponse.json({
      totalPublished: existing.length,
      publishedTitles: existing.map((p) => p.title),
      /* موضوع کامل — رانر برای تولید به related/landing/brief نیاز دارد */
      pending,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
