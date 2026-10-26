import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageView, landingOgImage } from "@/components/landing/landing-view";
import { SITE_INFO } from "@/components/landing/landing-chrome";
import { getLanding, LANDING_URLS } from "@/lib/landing-data";
import { SITE } from "@/lib/data";
import { tehranToday, localIsoDay } from "@/lib/jalali";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLanding("best-jaw-surgeon-tehran");
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: {
      canonical: "/best-jaw-surgeon-tehran",
      languages: {
        fa: "/best-jaw-surgeon-tehran",
        en: "/en/jaw-surgery-in-iran",
        "x-default": "/best-jaw-surgeon-tehran",
      },
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: LANDING_URLS["best-jaw-surgeon-tehran"],
      images: landingOgImage(data),
    },
  };
}

export default async function BestJawSurgeonTehranPage() {
  const data = await getLanding("best-jaw-surgeon-tehran");
  if (!data) notFound();

  const lastReviewed = localIsoDay(tehranToday());

  /* اسکیمای صفحه پیلار — MedicalWebPage + موجودیت Physician
     (صفحه «بهترین دکتر جراحی فک و صورت تهران» — نیت تجاری/برند) */
  const entityLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        name: "بهترین دکتر جراحی فک و صورت تهران | دکتر حامد کرمانی",
        url: LANDING_URLS["best-jaw-surgeon-tehran"],
        inLanguage: "fa-IR",
        lastReviewed,
        specialCommitment: "به روزرسانی معیارها و آمار جراحی ها در هر بازنگری سالانه",
        about: { "@id": "#physician" },
        author: { "@id": "#physician" },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
      },
      {
        "@type": "Physician",
        "@id": "#physician",
        name: "دکتر حامد کرمانی",
        alternateName: "Dr. Hamed Kermani",
        medicalSpecialty: "OralAndMaxillofacialSurgery",
        description:
          "متخصص جراحی فک و صورت (OMFS) با بورد وزارت بهداشت، فلوشیپ کرانیوفاسیال دانشگاه علوم پزشکی تهران و بیش از ۱۲۰۰ جراحی فک موفق.",
        url: `${SITE.url}/about`,
        image: `${SITE.url}/images/blog/3d-best-jaw-surgeon-tehran.jpg`,
        telephone: SITE_INFO.phone,
        knowsAbout: [
          "جراحی ارتوگناتیک فک",
          "جنیوپلاستی",
          "اصلاح عدم تقارن صورت",
          "جراحی آپنه خواب",
          "پیوند استخوان فک",
          "تروما و شکستگی فک",
        ],
        memberOf: { "@type": "Organization", name: "انجمن جراحان فک و صورت ایران" },
        alumniOf: [
          { "@type": "Organization", name: "دانشگاه علوم پزشکی مشهد" },
          { "@type": "Organization", name: "دانشگاه علوم پزشکی تهران" },
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "تهران",
          addressCountry: "IR",
          streetAddress: SITE_INFO.address,
        },
        areaServed: { "@type": "City", name: "تهران" },
        availableService: [
          { "@type": "MedicalProcedure", name: "جراحی ارتوگناتیک فک بالا و پایین" },
          { "@type": "MedicalProcedure", name: "جنیوپلاستی و اصلاح چانه" },
          { "@type": "MedicalProcedure", name: "اصلاح عدم تقارن صورت" },
          { "@type": "MedicalProcedure", name: "جراحی فک برای آپنه خواب" },
        ],
      },
    ],
  };

  return (
    <LandingPageView data={data} url={LANDING_URLS["best-jaw-surgeon-tehran"]} serviceLd={entityLd} />
  );
}
