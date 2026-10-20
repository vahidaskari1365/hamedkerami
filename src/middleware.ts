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

/* دامنه رسمی سایت (منبع واحد: SITE.url در lib/data.ts) —
   هر درخواستی با هاست دیگر (مثلاً www.dr-kermani.com) باید ۳۰۸
   به دامنه اصلی ریدایرکت شود؛ وگرنه گوگل دو نسخه از کل سایت
   (www و بدون www) می‌بیند و سایت‌مپ در Search Console خطای
   «URL not allowed / Couldn't fetch» می‌دهد. */
const CANONICAL_HOST = "dr-kermani.com";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];

  /* فقط برای هاست www ریدایرکت بزن — هاست‌های IP (مثل فراخوانی
     deploy-hook روی 213.176.126.162) و لوکال‌ها دست‌نخورده بمانند */
  if (host === `www.${CANONICAL_HOST}`) {
    const url = req.nextUrl.clone();
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

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
