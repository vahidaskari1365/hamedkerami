import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

/** آمار بازدید + خلاصه‌ی پیام‌ها برای داشبورد
 *  تجمیع در JS (به جای date() در SQLite که با فرمت DateTime پرisma کار نمی‌کند)
 *  حجم ترافیک سایت کم است — خواندن رکوردهای بازه مشکلی ندارد */
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "دسترسی ندارید" }, { status: 401 });
  }

  const days = Math.min(
    90,
    Math.max(7, parseInt(req.nextUrl.searchParams.get("days") || "30", 10) || 30)
  );

  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const views = await db.pageView.findMany({
      where: { createdAt: { gte: since } },
      select: {
        createdAt: true,
        path: true,
        referrer: true,
        device: true,
        browser: true,
        sessionId: true,
      },
    });

    /* روزهای بازه را از قبل بساز تا نمودار روزهای خالی را هم نشان دهد */
    const dailyMap = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dailyMap.set(d.toISOString().slice(0, 10), 0);
    }

    const pathMap = new Map<string, number>();
    const refMap = new Map<string, number>();
    const deviceMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    const sessions = new Set<string>();
    let today = 0;
    let week = 0;

    for (const v of views) {
      const day = v.createdAt.toISOString().slice(0, 10);
      if (dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
      if (v.createdAt >= todayStart) today++;
      if (v.createdAt >= weekStart) week++;
      if (!v.path.startsWith("/admin")) {
        pathMap.set(v.path, (pathMap.get(v.path) || 0) + 1);
      }
      refMap.set(v.referrer || "", (refMap.get(v.referrer || "") || 0) + 1);
      deviceMap.set(v.device, (deviceMap.get(v.device) || 0) + 1);
      browserMap.set(v.browser || "نامشخص", (browserMap.get(v.browser || "نامشخص") || 0) + 1);
      sessions.add(v.sessionId);
    }

    const top = (m: Map<string, number>, n: number) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

    const messagesCount = await db.contactMessage.count({
      where: { createdAt: { gte: since } },
    });
    const latestMessages = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    return NextResponse.json({
      ok: true,
      daily: [...dailyMap.entries()].map(([day, views]) => ({ day, views })),
      topPaths: top(pathMap, 8).map(([path, v]) => ({ path, views: v })),
      referrers: top(refMap, 6).map(([source, v]) => ({
        source: source || "مستقیم",
        views: v,
      })),
      devices: [...deviceMap.entries()].map(([device, v]) => ({ device, views: v })),
      browsers: top(browserMap, 6).map(([browser, v]) => ({ browser, views: v })),
      totals: {
        today,
        week,
        period: views.length,
        all: await db.pageView.count(),
        uniqueSessions: sessions.size,
      },
      messagesCount,
      latestMessages,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "خطای آمار" }, { status: 500 });
  }
}
