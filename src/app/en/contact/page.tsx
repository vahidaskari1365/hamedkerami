import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/schema";
import { EnAppointmentForm } from "@/components/en/appointment-form";
import { SITE } from "@/lib/data";

/* ============================================================
   /en/contact — تماس و رزرو نوبت انگلیسی
   فرم → همان API نوبت فارسی → پنل ادمین با مارکر [EN]
   ============================================================ */

export const metadata: Metadata = {
  title: {
    absolute: "Contact & Book an Appointment — Dr. Hamed Kermani Clinic, Tehran",
  },
  description:
    "Book an appointment with Dr. Hamed Kermani, oral & maxillofacial surgeon in Tehran: online request form, clinic address (Keshavarz Blvd), phone +98 21 6692 1500 and WhatsApp for international patients.",
  alternates: {
    canonical: "/en/contact",
    languages: { fa: "/contact", en: "/en/contact", "x-default": "/contact" },
  },
  openGraph: {
    title: "Contact & Booking — Dr. Hamed Kermani, Tehran",
    description:
      "Request an appointment online or via WhatsApp — clinic on Keshavarz Boulevard, Tehran. International patients welcome.",
    url: `${SITE.url}/en/contact`,
    type: "website",
  },
};

export default function EnContactPage() {
  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "@id": `${SITE.url}/en/contact#webpage`,
          url: `${SITE.url}/en/contact`,
          name: "Contact & appointment booking — Dr. Hamed Kermani clinic",
          inLanguage: "en",
          about: { "@id": `${SITE.url}/#physician` },
        }}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/en` },
            { "@type": "ListItem", position: 2, name: "Contact & Booking", item: `${SITE.url}/en/contact` },
          ],
        }}
      />

      {/* هدر */}
      <header className="bg-ink pb-14 pt-32 text-white sm:pb-16 sm:pt-36">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <Link href="/en" className="transition hover:text-teal">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-white/80">Contact &amp; Booking</span>
          </nav>
          <h1 className="mt-6 text-2xl font-black leading-[1.3] sm:text-4xl">
            Contact &amp; <span className="text-gold-soft">appointment booking</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/70">
            Choose your doctor and preferred day — your request goes straight to the
            clinic system and our staff will contact you to confirm. The clinic is open
            Saturday to Wednesday, 3:00 to 7:00 PM (Tehran time).
          </p>
        </div>
      </header>

      {/* فرم */}
      <section className="bg-bone py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <EnAppointmentForm />
        </div>
      </section>
    </>
  );
}
