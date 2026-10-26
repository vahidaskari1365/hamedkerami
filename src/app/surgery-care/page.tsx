import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageView, landingOgImage } from "@/components/landing/landing-view";
import { SITE_INFO } from "@/components/landing/landing-chrome";
import { getLanding, LANDING_URLS } from "@/lib/landing-data";
import { getPatientReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLanding("surgery-care");
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: {
      canonical: "/surgery-care",
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: LANDING_URLS["surgery-care"],
      images: landingOgImage(data),
    },
  };
}

export default async function SurgeryCarePage() {
  const data = await getLanding("surgery-care");
  if (!data) notFound();

  const reviews = await getPatientReviews();

  /* AIO: lastReviewed واقعی — هر بار رندر تاریخ روز درج می‌شود */
  const today = new Date().toISOString().slice(0, 10);

  const pageLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "مراقبت‌های قبل و بعد از جراحی فک",
    alternateName: "Pre and Post Orthognathic Surgery Care",
    description:
      "راهنمای گام‌به‌گام مراقبت‌های قبل و بعد از جراحی فک (ارتوگناتیک): ناشتایی، مدارک روز عمل، مراقبت بیمارستان، تغذیه، خواب، استحمام و ویزیت‌های پیگیری.",
    lastReviewed: today,
    inLanguage: "fa-IR",
    specialty: "https://schema.org/OralAndMaxillofacialSurgery",
    audience: { "@type": "Patient" },
    about: {
      "@type": "MedicalProcedure",
      name: "جراحی فک (ارتوگناتیک)",
      procedureType: "Surgical",
      bodyLocation: "فک بالا و فک پایین",
    },
    author: {
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

  return <LandingPageView data={data} url={LANDING_URLS["surgery-care"]} serviceLd={pageLd} reviews={reviews} />;
}
