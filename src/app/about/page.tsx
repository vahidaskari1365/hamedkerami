import type { Metadata } from "next";
import { SiteShell } from "@/components/site-chrome";
import { AboutPage } from "@/components/pages/about";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "درباره دکتر حامد کرمانی | رزومه، سوابق و مدارک جراح فک و صورت" },
  description:
    "رزومه دکتر حامد کرمانی، متخصص جراحی فک و صورت و فلوشیپ جراحی های کرانیوفاسیال از دانشگاه علوم پزشکی تهران؛ بیش از ۱۲۰۰ جراحی فک، ۲۰۰۰۰ ایمپلنت، ۱۸ مقاله علمی و سابقه استادی دانشگاه.",
  alternates: {
    canonical: "/about",
    languages: { fa: "/about", en: "/en/about", "x-default": "/about" },
  },
  openGraph: {
    title: "درباره دکتر حامد کرمانی | جراح فک و صورت",
    description:
      "رزومه، مدارک بین‌المللی و سوابق جراحی دکتر حامد کرمانی — متخصص جراحی فک و صورت و فلوشیپ کرانیوفاسیال در تهران.",
    url: `${SITE.url}/about`,
    type: "profile",
  },
};

/* ============================================================
   اسکیمای Person + MedicalBusiness — AIO/GEO
   موجودیت دکتر و مطب برای موتورهای جستجو و LLM ها:
   - Person (Physician) با تخصص، تحصیلات و آمار
   - MedicalBusiness با نشانی، geo، ساعت کاری و sameAs
   ============================================================ */
const physicianLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "دکتر حامد کرمانی",
  alternateName: "Dr. Hamed Kermani",
  givenName: "حامد",
  familyName: "کرمانی",
  jobTitle: "متخصص جراحی های فک و صورت",
  description:
    "متخصص جراحی فک و صورت و فلوشیپ جراحی های کرانیوفاسیال از دانشگاه علوم پزشکی تهران؛ بیش از ۱۲۰۰ جراحی فک و ۲۰۰۰۰ ایمپلنت دندان و ۱۸ مقاله علمی.",
  url: `${SITE.url}/about`,
  image: `${SITE.url}/images/dr-profile.jpg`,
  telephone: `+98${SITE.phone.slice(1)}`,
  worksFor: {
    "@type": "MedicalBusiness",
    name: "مطب دکتر حامد کرمانی",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "دانشگاه علوم پزشکی تهران",
  },
  hasCredential: [
    "متخصص جراحی فک و صورت (OMFS)",
    "فلوشیپ جراحی های کرانیوفاسیال",
  ],
  knowsAbout: [
    "جراحی ارتوگناتیک",
    "جراحی دو فک (بایمکس)",
    "جنیوپلاستی",
    "ایمپلنت دندان",
    "ایمپلنت زایگوماتیک",
    "جراحی TMJ",
  ],
  medicalSpecialty: "OralAndMaxillofacialSurgery",
  sameAs: [SITE.instagram, SITE.aparat],
};

const clinicLd = {
  "@context": "https://schema.org",
  "@type": ["MedicalBusiness", "MedicalClinic"],
  "@id": `${SITE.url}/#clinic`,
  name: "مطب دکتر حامد کرمانی",
  alternateName: "Dr. Hamed Kermani Clinic",
  description:
    "مطب تخصصی جراحی فک و صورت و ایمپلنت دندان در تهران — ارتوگناتیک، جنیوپلاستی، بایمکس، ایمپلنت و جراحی های کرانیوفاسیال.",
  url: SITE.url,
  telephone: `+98${SITE.phone.slice(1)}`,
  medicalSpecialty: "OralAndMaxillofacialSurgery",
  priceRange: "۹۰ تا ۲۴۰ میلیون تومان",
  currenciesAccepted: "IRR",
  paymentAccepted: "Cash, Installment",
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
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
      opens: "15:00",
      closes: "19:00",
    },
  ],
  sameAs: [SITE.instagram, SITE.aparat],
  employee: { "@id": `${SITE.url}/about#physician` },
  founder: {
    "@type": "Person",
    "@id": `${SITE.url}/about#physician`,
    name: "دکتر حامد کرمانی",
  },
};

export default function Page() {
  return (
    <SiteShell>
      <AboutPage />
      <JsonLdScript
        data={[
          { ...physicianLd, "@id": `${SITE.url}/about#physician` },
          clinicLd,
          breadcrumbLd([{ name: "درباره دکتر", path: "/about" }]),
        ]}
      />
    </SiteShell>
  );
}
