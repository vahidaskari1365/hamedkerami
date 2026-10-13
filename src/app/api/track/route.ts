import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visitorSessionId } from "@/lib/auth";

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

/** ثبت بازدید صفحه — از کلاینت با beacon فراخوانی می‌شود */
export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = (await req.json()) as {
      path?: string;
      referrer?: string;
    };
    if (!path || path.startsWith("/admin")) {
      return new NextResponse(null, { status: 204 });
    }
    const ua = req.headers.get("user-agent") || "";
    if (/bot|crawler|spider|lighthouse/i.test(ua)) {
      return new NextResponse(null, { status: 204 });
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const { device, browser } = parseUA(ua);

    await db.pageView.create({
      data: {
        path: path.slice(0, 120),
        referrer: (referrer || "").slice(0, 300),
        device,
        browser,
        sessionId: visitorSessionId(ip, ua),
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
