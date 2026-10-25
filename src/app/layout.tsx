import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa-register";
import { getSiteContent } from "@/lib/site-content";

/* ---------------- iOS Splash Screens (PWA) ----------------
   هر آیفون/آیپد اندازه و DPR خودش را دارد؛ iOS لینک matching
   با media را انتخاب می‌کند. اسپلش‌ها با scripts/gen-ios-splash.py
   ساخته می‌شوند (لوگو روی لاک مشکی + خط طلایی). */
const APPLE_SPLASHES: { href: string; media: string }[] = [
  { href: "/splash/apple-splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
  { href: "/splash/apple-splash-1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
  { href: "/splash/apple-splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
  { href: "/splash/apple-splash-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
  { href: "/splash/apple-splash-1242x2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" },
  { href: "/splash/apple-splash-828x1792.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" },
  { href: "/splash/apple-splash-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
  { href: "/splash/apple-splash-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
  { href: "/splash/apple-splash-1668x2388.png", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" },
];

/* ---------------- Metadata: SEO + GEO + AEO (از دیتابیس) ---------------- */
export async function generateMetadata(): Promise<Metadata> {
  const { site: SITE } = await getSiteContent();
  return {
  metadataBase: new URL(SITE.url),
  /* فید RSS از متادیتا حذف شد — چون هر صفحه‌ای که alternates خودش را
     تعریف کند (canonical)، آبجکت alternates لایه را کامل override می‌کند
     و لینک فید از head حذف می‌شد (ممیزی GEO: «No RSS/Atom feed»).
     حالا لینک فید مستقیم در <body> رندر می‌شود و React 19 آن را به
     <head> منتقل می‌کند؛ هیچ صفحه‌ای نمی‌تواند حذفش کند. */
  title: {
    default: "دکتر حامد کرمانی | متخصص جراحی فک و صورت در تهران",
    template: "%s | دکتر حامد کرمانی",
  },
  description: SITE.metaDescription,
  keywords: [
    "جراحی فک و صورت",
    "دکتر جراحی فک",
    "جراحی فک تهران",
    "ارتوسرجری",
    "ارتوگناتیک",
    "جراحی ارتوگناتیک فک",
    "جراحی دو فک",
    "بایمکس",
    "مونومکس",
    "جراحی تک فک",
    "جنیوپلاستی",
    "جراحی چانه",
    "عمل چانه",
    "بلفاروپلاستی",
    "جراحی زیبایی صورت",
    "ایمپلنت دندان",
    "ایمپلنت دندان تهران",
    "کاشت دندان تهران",
    "ایمپلنت پاسداران",
    "ایمپلنت زایگوماتیک",
    "پروتز مفصل فک",
    "مفصل گیجگاهی فک",
    "فک جا موند",
    "دررفتگی فک",
    "بازسازی فک",
    "فلوشیپ کرانیوفاسیال",
    "دکتر حامد کرمانی",
    "جراح فک و صورت",
    "maxillofacial surgeon iran",
    "orthognathic surgery tehran",
    "jaw surgery cost iran",
    "dental implant tehran",
  ],
  authors: [{ name: "دکتر حامد کرمانی", url: SITE.url }],
  creator: "دکتر حامد کرمانی",
  publisher: "دکتر حامد کرمانی",
  /* نکته سئو: canonical سراسری حذف شد — هر صفحه canonical خودش را دارد
     (اگر اینجا canonical="/" می‌ماند، صفحاتی که تعریف نمی‌کردند duplicate معرفی می‌شدند) */
  category: "Health",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "دکتر حامد کرمانی",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    /* iOS splash screens — وقتی اپ نصب‌شده باز می‌شود، به‌جای سفیدی
       لوگوی سایت روی لاک مشکی نمایش داده می‌شود (حالت اپ بومی) */
    other: APPLE_SPLASHES.map((s) => ({
      rel: "apple-touch-startup-image" as const,
      url: s.href,
      media: s.media,
    })),
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE.url,
    siteName: "دکتر حامد کرمانی | جراحی فک و صورت",
    title: "دکتر حامد کرمانی | متخصص جراحی فک و صورت و فلوشیپ کرانیوفاسیال",
    description: SITE.metaDescription,
    images: [
      {
        url: "/images/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "دکتر حامد کرمانی، متخصص جراحی فک و صورت و فلوشیپ کرانیوفاسیال",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "دکتر حامد کرمانی | متخصص جراحی فک و صورت",
    description: SITE.metaDescription,
    images: ["/images/og-cover.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "IR-23",
    "geo.placename": "Tehran",
    "geo.position": `${SITE.geo.lat};${SITE.geo.lng}`,
    ICBM: `${SITE.geo.lat}, ${SITE.geo.lng}`,
    /* iOS قدیمی (قبل از ۱۷.۴) فقط متای با پیشوند apple را می شناسد —
       بدون آن «افزودن به صفحه اصلی» به جای اپ تمام صفحه، تب سافاری باز می کند */
    "apple-mobile-web-app-capable": "yes",
  },
  };
}

export const viewport: Viewport = {
  themeColor: "#0d0e0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* ---------------- JSON-LD: SEO + AEO + GEO (از دیتابیس) ---------------- */
async function JsonLd() {
  const { site: SITE, services: SERVICES, lastUpdated } = await getSiteContent();
  const physicianLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${SITE.url}/#physician`,
    name: "دکتر حامد کرمانی",
    alternateName: "Dr. Hamed Kermani",
    url: SITE.url,
    image: `${SITE.url}/images/dr-photo.png`,
    logo: `${SITE.url}/images/logo.png`,
    telephone: "+989382080270",
    description: SITE.metaDescription,
    medicalSpecialty: "OralAndMaxillofacialSurgery",
    priceRange: "$$$",
    currenciesAccepted: "IRR",
    paymentAccepted: "Cash",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "تهران",
      addressRegion: "تهران",
      addressCountry: "IR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.lat,
      longitude: SITE.geo.lng,
    },
    hasMap: SITE.maps,
    sameAs: [SITE.instagram, SITE.aparat],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Monday", "Tuesday", "Wednesday"],
        opens: "15:00",
        closes: "19:00",
      },
    ],
    knowsLanguage: ["fa", "en"],
    /* contactPoint — اعتبارسازی entity برای موتورهای جستجو و پاسخ‌محور
       (پیشنهاد geo-optimizer-skill) */
    contactPoint: [{
      "@type": "ContactPoint",
      telephone: "+989382080270",
      contactType: "appointments",
      availableLanguage: ["fa", "en"],
    }],
    memberOf: {
      "@type": "MedicalOrganization",
      name: "دانشگاه علوم پزشکی تهران — فلوشیپ جراحی کرانیوفاسیال",
    },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "دانشگاه علوم پزشکی مشهد" },
      { "@type": "CollegeOrUniversity", name: "دانشگاه علوم پزشکی تهران" },
      { "@type": "CollegeOrUniversity", name: "دانشگاه علوم پزشکی شهید بهشتی" },
    ],
  };

  const clinicLd = {
    "@context": "https://schema.org",
    /* MedicalOrganization — نوع شناخته‌شده در خانواده LocalBusiness؛
       Physician تنها برای موتورهای جستجو قابل‌فهم است ولی ممیزی entity
       (برند یکسان + اطلاعات تماس + Organization) این نوع را می‌خواهد */
    "@type": "MedicalOrganization",
    "@id": `${SITE.url}/#clinic`,
    /* GEO: name دقیقاً برابر نام برند در title/og:title — ممیزی
       brand-consistency نام‌ها را بین title/H1/schema مقایسه می‌کند */
    name: "دکتر حامد کرمانی",
    alternateName: [
      "Dr. Hamed Kermani Oral & Maxillofacial Surgery",
      "دکتر حامد کرمانی | جراحی فک و صورت",
    ],
    url: SITE.url,
    logo: `${SITE.url}/images/logo.png`,
    image: `${SITE.url}/images/og-cover.jpg`,
    telephone: "+989382080270",
    description: SITE.metaDescription,
    medicalSpecialty: "OralAndMaxillofacialSurgery",
    priceRange: "$$$",
    currenciesAccepted: "IRR",
    paymentAccepted: "Cash",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "تهران",
      addressRegion: "تهران",
      addressCountry: "IR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.lat,
      longitude: SITE.geo.lng,
    },
    hasMap: SITE.maps,
    sameAs: [SITE.instagram, SITE.aparat, SITE.maps],
    /* GEO: areaServed — سیگنال جغرافیایی برای entity checker
       (has_geo_schema) و شفاف‌سازی منطقه خدمت برای موتورهای پاسخ‌محور */
    areaServed: {
      "@type": "City",
      name: "تهران",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Monday", "Tuesday", "Wednesday"],
        opens: "15:00",
        closes: "19:00",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+989382080270",
        contactType: "appointments",
        availableLanguage: ["fa", "en"],
      },
    ],
    founder: { "@id": `${SITE.url}/#physician` },
    employee: { "@id": `${SITE.url}/#physician` },
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    /* GEO: name برند محض — هم‌خوان با title/og:title/schema کلینیک */
    name: "دکتر حامد کرمانی",
    alternateName: "دکتر حامد کرمانی | متخصص جراحی فک و صورت",
    inLanguage: "fa-IR",
    publisher: { "@id": `${SITE.url}/#physician` },
    /* author — WebSite زیرمجموعه CreativeWork است؛ سیگنال نویسنده
       (رفع جریمه missing author در ممیزی) */
    author: { "@id": `${SITE.url}/#physician` },
    /* dateModified — تازه‌ترین تغییر واقعی مقالات دیتابیس؛
       سیگنال freshness برای Perplexity، Google (G-DATES) و signals */
    ...(lastUpdated ? { dateModified: lastUpdated } : {}),
    /* SearchAction — قابل‌کشف بودن جستجوی داخلی برای ایجنت‌های AI
       (GEO/AIO — پیشنهاد geo-optimizer-skill) */
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  /* FAQPage سراسری حذف شد — دستورالعمل گوگل: سوال‌های FAQPage باید مرئی
     در همان صفحه باشند. این ۶ سوال فقط در صفحه اصلی رندر می‌شوند،
     پس اسکیمای FAQPage هم فقط در src/app/page.tsx تزریق می‌شود
     (مقاله‌ها FAQPage خودشان را از بدنه مقاله می‌سازند). */

  const servicesLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "خدمات جراحی فک و صورت دکتر حامد کرمانی",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MedicalProcedure",
        name: s.title,
        procedureType: "Surgical",
        howPerformed:
          "جراحی زیر بیهوشی در بیمارستان با تیم مجرب، همراه با پیگیری دوره نقاهت.",
        performer: { "@id": `${SITE.url}/#physician` },
      },
    })),
  };

  /* جلوگیری از تزریق </script> — کاراکتر < داخل JSON به escape امن تبدیل می‌شود */
  const safeJsonLd = (obj: unknown) =>
    JSON.stringify(obj).replace(/</g, "\\u003c");

  /* رندر idiomatik به‌صورت کامپوننت (await خودکار توسط RSC) */
  return (
    <>
      {/* فید RSS — برای کشف محتوای جدید توسط AI/خواننده‌ها (GEO)؛
          React 19 این تگ را به <head> منتقل می‌کند */}
      <link rel="alternate" type="application/rss+xml" title="RSS — دکتر حامد کرمانی" href={`${SITE.url}/feed.xml`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(physicianLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(clinicLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(servicesLd) }}
      />
    </>
  );
}

/* ---------------- Google Analytics 4 ----------------
   استریم رسمی: dr-kermani.com — Stream ID: 16163934366
   Measurement ID: G-BN9YBGCWSY
   (analytics.google.com > Admin > Data Streams > Web)
   ID به‌صورت fallback در کد هست تا با هر بیلدی فعال بماند؛
   اگر خواستید عوض شود: متغیر محیطی NEXT_PUBLIC_GA_MEASUREMENT_ID
   موقع build (در deploy.yml یا .env) مقدار جدید می‌گیرد.
   ناوبری hash-based سایت با Enhanced Measurement (history change
   events) خودکار به‌عنوان page_view ثبت می‌شود. */
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-BN9YBGCWSY";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        {/* ناحیه اعلام دسترس‌پذیر — به‌روزرسانی‌های async (توست/خطا) را به
            فناوری‌های کمکی و ایجنت‌های AI اعلام می‌کند (ممیزی GEO بند ۱۸) */}
        <div id="aria-live-region" aria-live="polite" aria-atomic="true" className="sr-only" />
        <JsonLd />
        {children}
        <Toaster />
        <PwaRegister />
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
