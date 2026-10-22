import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageView, landingOgImage } from "@/components/landing/landing-view";
import { getLanding, LANDING_URLS } from "@/lib/landing-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLanding("dental-implant");
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: { canonical: "/dental-implant" },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: LANDING_URLS["dental-implant"],
      images: landingOgImage(data),
    },
  };
}

export default async function DentalImplantPage() {
  const data = await getLanding("dental-implant");
  if (!data) notFound();

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: "ایمپلنت دندان",
    alternateName: "Dental Implant",
    procedureType: "Surgical",
    bodyLocation: "فک بالا و پایین",
    description:
      "جایگزینی دندان از دست رفته با ریشه تیتانیومی و روکش سرامیکی؛ برندهای آلمانی، سوئیسی، آمریکایی و کره ای.",
    performer: {
      "@type": "Physician",
      name: "دکتر حامد کرمانی",
      medicalSpecialty: "OralAndMaxillofacialSurgery",
      telephone: "09382080270",
    },
  };

  return <LandingPageView data={data} url={LANDING_URLS["dental-implant"]} serviceLd={serviceLd} />;
}
