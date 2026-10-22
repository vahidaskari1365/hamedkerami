import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-chrome";
import { AppointmentClient } from "@/components/appointment-client";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { SITE } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "رزرو نوبت آنلاین مطب | دکتر حامد کرمانی — جراح فک و صورت",
  description:
    "نوبت‌دهی آنلاین مطب دکتر حامد کرمانی در تهران؛ انتخاب روز شمسی و پزشک (جراحی فک و صورت یا پروتزهای دندانی) در چند ثانیه. آدرس: بلوار کشاورز، تقاطع جمالزاده — تلفن: ۰۹۳۸-۲۰۸۰۲۷۰",
  alternates: { canonical: "/appointment" },
  openGraph: {
    title: "رزرو نوبت آنلاین مطب دکتر حامد کرمانی",
    description:
      "روز و پزشک را از تقویم شمسی انتخاب کنید؛ همکاران مطب برای تأیید نهایی تماس می‌گیرند.",
    url: `${SITE.url}/appointment`,
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: "رزرو نوبت مطب دکتر حامد کرمانی" }],
  },
};

export default function AppointmentPage() {
  return (
    <SiteShell>
      <JsonLdScript
        data={breadcrumbLd([{ name: "نوبت‌دهی", path: "/appointment" }])}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalClinic",
          name: "مطب دکتر حامد کرمانی",
          url: `${SITE.url}/appointment`,
          telephone: SITE.phone,
          address: {
            "@type": "PostalAddress",
            streetAddress: SITE.address,
            addressLocality: "تهران",
            addressCountry: "IR",
          },
          geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
          availableService: {
            "@type": "MedicalProcedure",
            name: "مشاوره و درمان جراحی فک و صورت",
          },
        }}
      />

      {/* هدر صفحه */}
      <header className="bg-ink pb-14 pt-32 text-white sm:pb-16 sm:pt-36">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <Link href="/" className="transition hover:text-teal">خانه</Link>
            <span aria-hidden>/</span>
            <span className="text-white/80">نوبت‌دهی آنلاین</span>
          </nav>
          <h1 className="mt-6 text-2xl font-black leading-[1.5] sm:text-4xl sm:leading-[1.5]">
            رزرو نوبت آنلاین مطب
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/70">
            پزشک و روز مراجعه را از تقویم شمسی انتخاب کنید؛ درخواست شما مستقیم در سامانه مطب ثبت
            می‌شود و همکاران ما برای تأیید نهایی تماس می‌گیرند. مطب شنبه تا چهارشنبه، ۱۵ تا ۱۹ فعال
            است.
          </p>
        </div>
      </header>

      {/* فرم نوبت‌دهی */}
      <section className="bg-bone py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <AppointmentClient />
        </div>
      </section>
    </SiteShell>
  );
}
