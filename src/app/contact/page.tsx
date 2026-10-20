import type { Metadata } from "next";
import { SiteShell } from "@/components/site-chrome";
import { ContactPage } from "@/components/pages/contact";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "تماس و رزرو نوبت | مطب دکتر حامد کرمانی — تهران، کشاورز" },
  description:
    "رزرو نوبت مطب دکتر حامد کرمانی، متخصص جراحی فک و صورت: تهران، بلوار کشاورز، تقاطع جمالزاده، ساختمان پزشکان کوثر، طبقه ۳. تلفن ۰۲۱-۶۶۹۲۱۵۰۰ — شنبه تا چهارشنبه ۱۵ تا ۱۹.",
  alternates: {
    canonical: "/contact",
    languages: { fa: "/contact", en: "/en/contact", "x-default": "/contact" },
  },
  openGraph: {
    title: "تماس و رزرو نوبت مطب دکتر حامد کرمانی",
    description:
      "تهران، بلوار کشاورز، تقاطع جمالزاده، ساختمان پزشکان کوثر — تلفن ۰۲۱-۶۶۹۲۱۵۰۰.",
    url: `${SITE.url}/contact`,
    type: "website",
  },
};

export default function Page() {
  return (
    <SiteShell>
      <ContactPage />
      <JsonLdScript data={breadcrumbLd([{ name: "تماس با ما", path: "/contact" }])} />
    </SiteShell>
  );
}
