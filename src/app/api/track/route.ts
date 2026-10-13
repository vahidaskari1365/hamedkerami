import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visitorSessionId, rateLimit } from "@/lib/auth";

function parseUA(ua: string): { device: string; browser: string } {
  const device = /iPad|Tablet/i.test(ua)
    ? "tablet"
    : /Mobi|iPhone|Android/i.test(ua)
      ? "mobile"
      : "desktop";

  let browser = "سایر";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/SamsungBrowser/i.test(ua)) browser = "Samsung";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua)) browser = "Safari";
  else if (/bot|crawler|spider/i.test(ua)) browser = "ربات";

  return { device, browser };
}

/* ضد اسپم: هر بازدید تکراریِ همان صفحه در بازه‌ی کوتاه ثبت نمی‌شود
   و سقف ساعتی هر IP هم کنترل می‌شود تا دیتابیس پر نشود */
const recent = new Map<string, number>();

function recentlySeen(key: string, windowMs: number): boolean {
  const now = Date.now();
  const last = recent.get(key);
  recent.set(key, now);
  if (recent.size > 20000) {
    for (const [k, t] of recent) {
      if (now - t > windowMs) recent.delete(k);
    }
  }
  return last !== undefined && now - last < windowMs;
}

/** ثبت بازدید صفحه — از کلاینت با beacon فراخوانی می‌شود */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = typeof body?.path === "string" ? body.path : "";
    const referrer = typeof body?.referrer === "string" ? body.referrer : "";
    /* فقط مسیرهای داخلی سایت — شروع با «/» و بدون اسکیم خارجی */
    if (!path || !path.startsWith("/") || path.startsWith("//") || path.length > 120) {
      return new NextResponse(null, { status: 204 });
    }
    if (path.startsWith("/admin")) {
      return new NextResponse(null, { status: 204 });
    }
    const ua = req.headers.get("user-agent") || "";
    if (/bot|crawler|spider|lighthouse/i.test(ua)) {
      return new NextResponse(null, { status: 204 });
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

    /* سقف ساعتی: حداکثر ۱۲۰ درخواست ثبت‌شده از هر IP */
    if (!rateLimit(`track:${ip}`, 120, 60 * 60 * 1000)) {
      return new NextResponse(null, { status: 204 });
    }
    const session = visitorSessionId(ip, ua);
    /* همان صفحه در ۳۰ ثانیه‌ی قبلی برای همین بازدیدکننده = تکراری */
    if (recentlySeen(`${session}|${path}`, 30 * 1000)) {
      return new NextResponse(null, { status: 204 });
    }

    const ref = referrer.startsWith("http://") || referrer.startsWith("https://")
      ? referrer.slice(0, 300)
      : "";

    await db.pageView.create({
      data: {
        path: path.slice(0, 120),
        referrer: ref,
        device: parseUA(ua).device,
        browser: parseUA(ua).browser,
        sessionId: session,
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
