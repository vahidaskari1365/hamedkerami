import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageView, landingOgImage } from "@/components/landing/landing-view";
import { SITE_INFO } from "@/components/landing/landing-chrome";
import { getLanding, LANDING_URLS } from "@/lib/landing-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLanding("jaw-surgery");
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: {
      canonical: "/jaw-surgery",
      languages: {
        fa: "/jaw-surgery",
        en: "/en/jaw-surgery-in-iran",
        "x-default": "/jaw-surgery",
      },
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: LANDING_URLS["jaw-surgery"],
      images: landingOgImage(data),
    },
  };
}

export default async function JawSurgeryPage() {
  const data = await getLanding("jaw-surgery");
  if (!data) notFound();

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: "جراحی فک (ارتوگناتیک)",
    alternateName: "Orthognathic Surgery",
    procedureType: "Surgical",
    bodyLocation: "فک بالا و فک پایین",
    description:
      "جراحی ارتوگناتیک برای اصلاح ناهنجاری های اسکلتی فک بالا و پایین؛ بهبود جویدن، گفتار، تنفس و هارمونی صورت.",
    howPerformed: "زیر بیهوشی عمومی در بیمارستان، با برش های داخل دهانی و صفحه و پیچ تیتانیومی",
    performer: {
      "@type": "Physician",
      name: "دکتر حامد کرمانی",
      medicalSpecialty: "OralAndMaxillofacialSurgery",
      address: {
        "@type": "PostalAddress",
        addressLocality: "تهران",
        addressCountry: "IR",
        streetAddress: SITE_INFO.address,
      },
      telephone: SITE_INFO.phone,
    },
  };

  return <LandingPageView data={data} url={LANDING_URLS["jaw-surgery"]} serviceLd={serviceLd} />;
}
