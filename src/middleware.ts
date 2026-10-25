import { NextResponse, type NextRequest } from "next/server";
import { HOME_MARKDOWN } from "@/lib/ai-home-md";

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

/* مسیرهای متادیتای سئو — هرگز نباید در LSCache ذخیره شوند.
   sitemap هر روز با مقاله جدید تغییر می‌کند؛ یک کپی stale (به‌خاطر
   s-maxage یک‌ساله خود هاست) هفته‌ها نسخه کهنه را به گوگل داد.
   no-store سخت‌گیرانه‌تر از no-cache است: حتی ذخیره هم ممنوع. */
const SEO_META_PATH = /^\/(sitemap\.xml|robots\.txt|llms\.txt|llms-full\.txt)$/;

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

  /* ============================================================
     مذاکره محتوا — نسخه Markdown صفحه اصلی (GEO / ai_discovery)
     ممیزی geo-optimizer-skill درخواست «/» با هدر Accept: text/markdown
     می‌فرستد و انتظار پاسخ Content-Type: text/markdown دارد.
     ایجنت‌های AI و ابزارهای متنی بدون اجرای JS نسخه تمیز می‌گیرند.
     ============================================================ */
  if (
    req.nextUrl.pathname === "/" &&
    /text\/markdown/i.test(req.headers.get("accept") ?? "")
  ) {
    return new NextResponse(HOME_MARKDOWN, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "no-cache, must-revalidate",
        Vary: "Accept",
      },
    });
  }

  const res = NextResponse.next();
  if (SEO_META_PATH.test(req.nextUrl.pathname)) {
    res.headers.set("Cache-Control", "no-store, must-revalidate, max-age=0");
  } else if (!IMMUTABLE_PATH.test(req.nextUrl.pathname)) {
    res.headers.set("Cache-Control", "no-cache, must-revalidate");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
