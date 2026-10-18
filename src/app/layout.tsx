import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa-register";
import { getSiteContent } from "@/lib/site-content";

/* ---------------- Metadata: SEO + GEO + AEO (از دیتابیس) ---------------- */
export async function generateMetadata(): Promise<Metadata> {
  const { site: SITE } = await getSiteContent();
  return {
  metadataBase: new URL(SITE.url),
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
  const { site: SITE, faq: FAQ, services: SERVICES } = await getSiteContent();
  const physicianLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${SITE.url}/#physician`,
    name: "دکتر حامد کرمانی",
    alternateName: "Dr. Hamed Kermani",
    url: SITE.url,
    image: `${SITE.url}/images/dr-photo.png`,
    logo: `${SITE.url}/images/logo.png`,
    telephone: "+982166921500",
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

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: "دکتر حامد کرمانی | متخصص جراحی فک و صورت",
    inLanguage: "fa-IR",
    publisher: { "@id": `${SITE.url}/#physician` },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(physicianLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(servicesLd) }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        <JsonLd />
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}
