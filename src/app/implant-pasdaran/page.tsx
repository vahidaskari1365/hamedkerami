import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageView, landingOgImage } from "@/components/landing/landing-view";
import { getLanding, LANDING_URLS } from "@/lib/landing-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLanding("implant-pasdaran");
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: { canonical: "/implant-pasdaran" },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: LANDING_URLS["implant-pasdaran"],
      images: landingOgImage(data),
    },
  };
}

export default async function ImplantPasdaranPage() {
  const data = await getLanding("implant-pasdaran");
  if (!data) notFound();

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: "مطب دکتر حامد کرمانی — ایمپلنت و جراحی فک و صورت",
    medicalSpecialty: "Dentistry",
    telephone: "09382080270",
    address: {
      "@type": "PostalAddress",
      addressLocality: "تهران",
      addressCountry: "IR",
      streetAddress: "بلوار کشاورز، تقاطع جمالزاده، ساختمان پزشکان کوثر، طبقه ۳ واحد ۱۲",
    },
    areaServed: ["تهران", "پاسداران", "نیاوران", "الهیه", "شمال تهران", "مرکز تهران"],
    priceRange: "۲۴ تا ۱۱۰ میلیون تومان به ازای هر واحد ایمپلنت",
  };

  return <LandingPageView data={data} url={LANDING_URLS["implant-pasdaran"]} serviceLd={serviceLd} />;
}
