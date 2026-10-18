import { NextResponse, type NextRequest } from "next/server";

/* ============================================================
   میان‌افزار کش — دو کار:

   ۱) /__cache-purge : پاسخی با هدر «X-LiteSpeed-Purge: *» برمی‌گرداند.
      سازوکار استاندارد LSCache برای پاک‌سازی از سمت مبدأ — چون هاست
      LiteSpeed صفحه را با s-maxage=31536000 (یک سال!) کش می‌کند و بدون
      این endpoint، نسخه‌ی تازه بعد از هر دیپلوی تا یک سال دیده نمی‌شد.

   ۲) صفحات HTML و پاسخ‌های داینامیک با «Cache-Control: no-cache»
      برمی‌گردند تا LSCache دیگر هیچ‌وقت صفحه را کش نکند.
      فایل‌های تغییرناپذیر (/_next/static، آپلودها) مستثنا هستند.
   ============================================================ */

const IMMUTABLE_PATH = /^\/(_next\/static|_next\/image|uploads|images|icons|favicon)\//;

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/__cache-purge") {
    return new NextResponse("cache purged", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-LiteSpeed-Purge": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  const res = NextResponse.next();
  if (!IMMUTABLE_PATH.test(req.nextUrl.pathname)) {
    res.headers.set("Cache-Control", "no-cache, must-revalidate");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
