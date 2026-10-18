import type { Metadata } from "next";
import { SiteShell } from "@/components/site-chrome";
import { GalleryPage } from "@/components/pages/gallery";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "گالری نمونه جراحی های فک و صورت | نتایج قبل و بعد" },
  description:
    "گالری نمونه جراحی های دکتر حامد کرمانی: نتایج قبل و بعد جراحی ارتوگناتیک (یک فک و دو فک)، جنیوپلاستی، بلفاروپلاستی و بازسازی فک با ایمپلنت دندان.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "گالری نمونه جراحی های فک و صورت | قبل و بعد",
    description:
      "نتایج واقعی جراحی ارتوگناتیک، جنیوپلاستی و بازسازی فک — نمونه های قبل و بعد.",
    url: `${SITE.url}/gallery`,
    type: "website",
  },
};

export default function Page() {
  return (
    <SiteShell>
      <GalleryPage />
      <JsonLdScript data={breadcrumbLd([{ name: "گالری", path: "/gallery" }])} />
    </SiteShell>
  );
}
