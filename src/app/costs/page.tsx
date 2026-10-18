import type { Metadata } from "next";
import { SiteShell } from "@/components/site-chrome";
import { CostsPage } from "@/components/pages/costs";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { SITE } from "@/lib/data";

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

export default function Page() {
  return (
    <SiteShell>
      <CostsPage />
      <JsonLdScript data={breadcrumbLd([{ name: "هزینه ها", path: "/costs" }])} />
    </SiteShell>
  );
}
