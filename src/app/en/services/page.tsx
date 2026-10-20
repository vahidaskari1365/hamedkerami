import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Hospital } from "lucide-react";
import { JsonLdScript } from "@/components/schema";
import { EN_SERVICES } from "@/lib/en-content";
import { SITE } from "@/lib/data";

/* ============================================================
   /en/services — خدمات جراحی فک و صورت به انگلیسی
   ============================================================ */

export const metadata: Metadata = {
  title: {
    absolute:
      "Services — Orthognathic Jaw Surgery, Genioplasty, Blepharoplasty & Dental Implants in Tehran",
  },
  description:
    "Oral & maxillofacial services by Dr. Hamed Kermani in Tehran: single-jaw and double-jaw (bimaxillary) orthognathic surgery, genioplasty, blepharoplasty, dental implants including zygomatic implants, sinus lift, GBR and full jaw reconstruction.",
  alternates: {
    canonical: "/en/services",
    languages: { fa: "/services", en: "/en/services", "x-default": "/services" },
  },
  openGraph: {
    title: "Jaw & Facial Surgery Services — Dr. Hamed Kermani, Tehran",
    description:
      "Orthognathic surgery, bimaxillary surgery, genioplasty, blepharoplasty, dental implants and jaw reconstruction in Tehran, Iran.",
    url: `${SITE.url}/en/services`,
    type: "website",
  },
};

export default function EnServicesPage() {
  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${SITE.url}/en/services#webpage`,
          url: `${SITE.url}/en/services`,
          name: "Jaw & facial surgery services — Dr. Hamed Kermani, Tehran",
          inLanguage: "en",
          about: { "@id": `${SITE.url}/#physician` },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: EN_SERVICES.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "MedicalProcedure",
                name: s.title,
                procedureType: "Surgical",
                performer: { "@id": `${SITE.url}/#physician` },
              },
            })),
          },
        }}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/en` },
            { "@type": "ListItem", position: 2, name: "Services", item: `${SITE.url}/en/services` },
          ],
        }}
      />

      {/* هدر */}
      <header className="bg-ink pb-14 pt-32 text-white sm:pb-16 sm:pt-36">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <Link href="/en" className="transition hover:text-teal">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-white/80">Services</span>
          </nav>
          <h1 className="mt-6 text-2xl font-black leading-[1.3] sm:text-4xl">
            Jaw, face &amp; implant <span className="text-gold-soft">surgery services</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/70">
            Every procedure is planned digitally, performed under general anaesthesia in a
            fully equipped hospital, and followed personally by Dr. Kermani through
            recovery — for local and international patients alike.
          </p>
        </div>
      </header>

      {/* بدنه */}
      <div className="bg-bone py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            {EN_SERVICES.map((s) => (
              <article key={s.title} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-ink/10">
                <h2 className="text-lg font-black text-ink">{s.title}</h2>
                <p className="mt-3 text-[13.5px] leading-7 text-foreground/65">{s.desc}</p>
                <ul className="mt-4 space-y-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[13px] leading-6 text-foreground/75">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-teal" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl bg-ink p-7 text-white">
              <p className="flex items-center gap-2 text-sm font-black text-gold-soft">
                <Hospital size={16} />
                Where does surgery take place?
              </p>
              <p className="mt-3 text-[13px] leading-7 text-white/70">
                Orthognathic and bimaxillary surgeries are performed under general
                anaesthesia in a fully equipped hospital in Tehran with an anaesthesiology
                team, while implants and minor oral surgeries are done at the clinic.
                Post-operative checks continue at the clinic until full recovery.
              </p>
            </div>
            <div className="rounded-3xl bg-white p-7 ring-1 ring-ink/10">
              <p className="text-sm font-black text-ink">Not sure which treatment you need?</p>
              <p className="mt-3 text-[13px] leading-7 text-foreground/65">
                That is exactly what the consultation is for. Send your records, and Dr.
                Kermani will map out the right procedure — or combination — for your case,
                including timing around any orthodontic treatment.
              </p>
              <Link
                href="/en/contact"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-teal px-5 py-2.5 text-sm font-black text-ink transition hover:scale-[1.03] hover:bg-gold-soft"
              >
                Request a consultation <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
