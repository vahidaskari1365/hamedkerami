import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/app-shell";
import { BLOG_POSTS, FAQ, SITE } from "@/lib/data";

/* ---------------- Metadata: SEO + GEO + AEO ---------------- */
export const metadata: Metadata = {
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
    "جراحی دو فک",
    "بایمکس",
    "جنیوپلاستی",
    "جراحی چانه",
    "بلفاروپلاستی",
    "ایمپلنت دندان",
    "کاشت دندان تهران",
    "بازسازی فک",
    "ایمپلنت زایگوماتیک",
    "فلوشیپ کرانیوفاسیال",
    "دکتر حامد کرمانی",
    "جراح فک و صورت",
    "maxillofacial surgeon iran",
    "orthognathic surgery tehran",
    "jaw surgery cost iran",
  ],
  authors: [{ name: "دکتر حامد کرمانی", url: SITE.url }],
  creator: "دکتر حامد کرمانی",
  publisher: "دکتر حامد کرمانی",
  alternates: { canonical: "/" },
  category: "Health",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE.url,
    siteName: "دکتر حامد کرمانی | جراحی فک و صورت",
    title: "دکتر حامد کرمانی | متخصص جراحی فک و صورت و فلوشیپ کرانیوفاسیال",
    description: SITE.metaDescription,
    images: [
      {
        url: "/images/dr-photo.png",
        width: 1200,
        height: 1200,
        alt: "دکتر حامد کرمانی، متخصص جراحی فک و صورت",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "دکتر حامد کرمانی | متخصص جراحی فک و صورت",
    description: SITE.metaDescription,
    images: ["/images/dr-photo.png"],
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

export const viewport: Viewport = {
  themeColor: "#0d1114",
  width: "device-width",
  initialScale: 1,
};

/* ---------------- JSON-LD: SEO + AEO + GEO ---------------- */
function JsonLd() {
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
    itemListElement: [
      "جراحی یک فک",
      "جراحی دو فک (بایمکس)",
      "بلفاروپلاستی",
      "جنیوپلاستی (جراحی چانه)",
      "ایمپلنت (کاشت دندان)",
      "بازسازی فک",
    ].map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MedicalProcedure",
        name: s,
        procedureType: "Surgical",
        howPerformed:
          "جراحی زیر بیهوشی در بیمارستان با تیم مجرب، همراه با پیگیری دوره نقاهت.",
        performer: { "@id": `${SITE.url}/#physician` },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesLd) }}
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
        {JsonLd()}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
