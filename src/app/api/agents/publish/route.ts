import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";
import { publishSubmittedArticle } from "@/lib/agents/publish";

/* ============================================================
   /api/agents/publish — دریافت مقاله تولیدشده در رانر گیت‌هاب
   POST با هدر x-agent-key (یا ادمین):
   { slug, title, excerpt, body, keyword, coverBase64 }
   → سردبیر QC + چک یکتایی + ذخیره در دیتابیس
   سایت‌مپ و llms.txt داینامیک خودکار شامل مقاله می‌شوند.
   ============================================================ */

export const dynamic = "force-dynamic";

async function isAdmin(): Promise<boolean> {
  try {
    const c = await cookies();
    if (c.get(SESSION_COOKIE)?.value) return true;
  } catch { /* ignore */ }
  return false;
}

export async function POST(req: Request) {
  const key = req.headers.get("x-agent-key");
  const secret = process.env.AGENT_SECRET || "";
  if (!((secret && key === secret) || (await isAdmin()))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { slug, title, excerpt, body: articleBody, keyword, coverBase64, cover: coverPath } = body ?? {};
    if (!slug || !title || !articleBody) {
      return NextResponse.json({ error: "fieds: slug/title/body الزامی است" }, { status: 400 });
    }
    /* جلوگیری از تکرار عنوان (اسلاگ قفل upsert است اما عنوان باید یکتا بماند) */
    const dup = await db.blogPost.findFirst({ where: { title: { equals: title } }, select: { slug: true } });
    if (dup) {
      return NextResponse.json({ ok: false, reason: "مقاله‌ای با همین عنوان قبلا منتشر شده (بدون تکرار)", slug: dup.slug, title });
    }
    const result = await publishSubmittedArticle(
      { slug, title, excerpt: excerpt || "", body: articleBody, keyword: keyword || "" },
      { coverBase64: coverBase64 || "", coverPath },
    );
    return NextResponse.json(result, { status: result.ok ? 201 : 422 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
