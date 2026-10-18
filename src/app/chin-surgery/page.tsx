import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageView, landingOgImage } from "@/components/landing/landing-view";
import { getLanding, LANDING_URLS } from "@/lib/landing-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLanding("chin-surgery");
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: { canonical: "/chin-surgery" },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: LANDING_URLS["chin-surgery"],
      images: landingOgImage(data),
    },
  };
}

export default async function ChinSurgeryPage() {
  const data = await getLanding("chin-surgery");
  if (!data) notFound();

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: "جراحی چانه (جنیوپلاستی)",
    alternateName: "Genioplasty / Chin Surgery",
    procedureType: "Surgical",
    bodyLocation: "استخوان چانه",
    description: "اصلاح چانه عقب‌رفته، جلوآمده، کوتاه یا نامتقارن با جابجایی استخوان چانه یا پروتز.",
    performer: {
      "@type": "Physician",
      name: "دکتر حامد کرمانی",
      medicalSpecialty: "OralAndMaxillofacialSurgery",
      telephone: "02166921500",
    },
  };

  return <LandingPageView data={data} url={LANDING_URLS["chin-surgery"]} serviceLd={serviceLd} />;
}
