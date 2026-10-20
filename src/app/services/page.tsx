import type { Metadata } from "next";
import { SiteShell } from "@/components/site-chrome";
import { ServicesPage } from "@/components/pages/services";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "خدمات جراحی فک و صورت | ارتوگناتیک، جنیوپلاستی، بلفاروپلاستی و ایمپلنت" },
  description:
    "خدمات تخصصی دکتر حامد کرمانی در تهران: جراحی ارتوگناتیک یک فک و دو فک (بایمکس)، جنیوپلاستی (جراحی چانه)، بلفاروپلاستی، ایمپلنت دندان و ایمپلنت زایگوماتیک، بازسازی فک و پروتز مفصل گیجگاهی.",
  alternates: {
    canonical: "/services",
    languages: { fa: "/services", en: "/en/services", "x-default": "/services" },
  },
  openGraph: {
    title: "خدمات جراحی فک و صورت دکتر حامد کرمانی",
    description:
      "ارتوگناتیک، بایمکس، جنیوپلاستی، بلفاروپلاستی، ایمپلنت دندان و بازسازی فک در تهران.",
    url: `${SITE.url}/services`,
    type: "website",
  },
};

export default function Page() {
  return (
    <SiteShell>
      <ServicesPage />
      <JsonLdScript data={breadcrumbLd([{ name: "خدمات", path: "/services" }])} />
    </SiteShell>
  );
}
