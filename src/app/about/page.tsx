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

export default function Page() {
  return (
    <SiteShell>
      <AboutPage />
      <JsonLdScript data={breadcrumbLd([{ name: "درباره دکتر", path: "/about" }])} />
    </SiteShell>
  );
}
