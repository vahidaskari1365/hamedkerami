import type { Metadata } from "next";
import { SiteShell } from "@/components/site-chrome";
import { BlogPage } from "@/components/pages/blog";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "وبلاگ آموزشی جراحی فک و صورت | مقالات دکتر حامد کرمانی" },
  description:
    "مقالات تخصصی جراحی فک و صورت: راهنمای کامل ارتوگناتیک، هزینه جراحی فک ۱۴۰۵، جراحی دو فک (بایمکس)، جنیوپلاستی، ایمپلنت دندان و ایمپلنت زایگوماتیک — با پاسخ کوتاه و تعرفه به روز.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "وبلاگ آموزشی جراحی فک و صورت | دکتر حامد کرمانی",
    description:
      "مقالات جامع و به‌روز درباره جراحی فک، چانه، ایمپلنت دندان و هزینه ها.",
    url: `${SITE.url}/blog`,
    type: "website",
  },
};

export default function Page() {
  return (
    <SiteShell>
      <BlogPage />
      <JsonLdScript data={breadcrumbLd([{ name: "وبلاگ", path: "/blog" }])} />
    </SiteShell>
  );
}
