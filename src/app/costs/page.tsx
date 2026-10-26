import type { Metadata } from "next";
import { SiteShell } from "@/components/site-chrome";
import { CostsPage } from "@/components/pages/costs";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { SITE } from "@/lib/data";
import { COSTS_FAQ } from "@/lib/costs-faq";
import { tehranToday, localIsoDay } from "@/lib/jalali";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "هزینه جراحی فک و صورت و ایمپلنت دندان (۱۴۰۵) | تعرفه کامل" },
  description:
    "تعرفه ۱۴۰۵ جراحی فک و صورت: هزینه جراحی چانه ۹۰ تا ۱۱۰ میلیون، یک فک ۱۷۰ تا ۱۸۰ میلیون، دو فک (بایمکس) ۱۹۰ تا ۲۰۰ میلیون تومان و قیمت ایمپلنت دندان برندهای آلمان، کره، سوییس و آمریکا.",
  alternates: { canonical: "/costs" },
  openGraph: {
    title: "هزینه جراحی فک و صورت و ایمپلنت دندان | تعرفه ۱۴۰۵",
    description:
      "جدول کامل تعرفه جراحی فک، چانه، ایمپلنت دندان و جراحی های تکمیلی در تهران.",
    url: `${SITE.url}/costs`,
    type: "website",
  },
};

/* آخرین به‌روزرسانی تعرفه‌ها — روز رندر (صفحه داینامیک) */
const lastReviewed = localIsoDay(tehranToday());

export default function Page() {
  return (
    <SiteShell>
      <CostsPage />
      <JsonLdScript
        data={[
          breadcrumbLd([{ name: "هزینه ها", path: "/costs" }]),
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            name: "هزینه جراحی فک و صورت و ایمپلنت دندان | تعرفه ۱۴۰۵",
            url: `${SITE.url}/costs`,
            inLanguage: "fa-IR",
            lastReviewed,
            specialCommitment: "بازبینی سالانه تعرفه‌ها در ۱ آذر",
            about: {
              "@type": "MedicalProcedure",
              name: "جراحی فک و صورت (ارتوگناتیک، جنیوپلاستی) و ایمپلنت دندان",
            },
            author: {
              "@type": "Physician",
              name: "دکتر حامد کرمانی",
              medicalSpecialty: "OralAndMaxillofacialSurgery",
              url: `${SITE.url}/about`,
            },
            publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: COSTS_FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
    </SiteShell>
  );
}
