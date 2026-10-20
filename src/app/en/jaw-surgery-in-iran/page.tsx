import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronRight, MessageCircle } from "lucide-react";
import { JsonLdScript } from "@/components/schema";
import { EN_LANDING } from "@/lib/en-content";
import { SITE } from "@/lib/data";

/* ============================================================
   /en/jaw-surgery-in-iran — لندینگ توریسم پزشکی
   آهنربای اصلی بیمار خارجی: کیورد "jaw surgery in Iran" +
   فرآیند سفر، هزینه، ویزا و دوره نقاهت — با FAQPage schema.
   ============================================================ */

export const metadata: Metadata = {
  title: {
    absolute:
      "Jaw Surgery in Iran — Cost, Process & Surgeon Guide (2026) | Dr. Hamed Kermani",
  },
  description:
    "Corrective jaw surgery in Iran explained: costs a fraction of US/UK prices, fellowship-trained surgeon in Tehran, online consultation before you fly, 10–14 day treatment trip and online follow-up. Full guide for international patients.",
  alternates: {
    canonical: "/en/jaw-surgery-in-iran",
    languages: { en: "/en/jaw-surgery-in-iran", "x-default": "/en/jaw-surgery-in-iran" },
  },
  openGraph: {
    title: "Jaw Surgery in Iran — The Complete Patient Guide",
    description:
      "Costs, process, visa letter, recovery timeline and follow-up for orthognathic surgery in Tehran with Dr. Hamed Kermani.",
    url: `${SITE.url}/en/jaw-surgery-in-iran`,
    type: "article",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: "Jaw surgery in Iran — patient guide by Dr. Hamed Kermani" }],
  },
};

export default function EnIranLandingPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: EN_LANDING.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          "@id": `${SITE.url}/en/jaw-surgery-in-iran#webpage`,
          url: `${SITE.url}/en/jaw-surgery-in-iran`,
          name: "Jaw Surgery in Iran — Orthognathic surgery guide for international patients",
          description: EN_LANDING.heroDesc,
          inLanguage: "en",
          about: { "@id": `${SITE.url}/#physician` },
          audience: { "@type": "Patient" },
          reviewedBy: { "@id": `${SITE.url}/#physician` },
          lastReviewed: "2026-10-20",
          significantLink: `${SITE.url}/en/contact`,
        }}
      />
      <JsonLdScript data={faqLd} />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/en` },
            { "@type": "ListItem", position: 2, name: "Jaw Surgery in Iran", item: `${SITE.url}/en/jaw-surgery-in-iran` },
          ],
        }}
      />

      {/* ---------- Hero ---------- */}
      <header className="relative overflow-hidden bg-ink pb-16 pt-32 text-white sm:pb-20 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(201,161,59,0.14),transparent)]" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-white/50">
              <Link href="/en" className="transition hover:text-teal">Home</Link>
              <span aria-hidden>/</span>
              <span className="text-white/80">Jaw Surgery in Iran</span>
            </nav>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-[11px] font-bold tracking-wide text-gold-soft">
              {EN_LANDING.eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-black leading-[1.25] sm:text-[2.6rem] sm:leading-[1.2]">
              {EN_LANDING.h1}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-8 text-white/70">
              {EN_LANDING.heroDesc}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/en/contact"
                className="flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-black text-ink shadow-lg shadow-teal/25 transition hover:scale-[1.03] hover:bg-gold-soft active:scale-95"
              >
                Send my records <ChevronRight size={16} />
              </Link>
              <a
                href="https://wa.me/989382080270?text=Hello%2C%20I%20am%20considering%20jaw%20surgery%20in%20Iran."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-b from-teal/25 to-transparent blur-xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-white/15 shadow-2xl shadow-black/50">
              <Image
                src="/images/cases/case-profile.jpg"
                alt="Profile analysis before orthognathic jaw surgery in Iran"
                width={640}
                height={800}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Why Iran ---------- */}
      <section className="bg-bone py-14 sm:py-16" aria-labelledby="en-why-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="en-why-h" className="text-2xl font-black text-ink sm:text-3xl">
            {EN_LANDING.whyTitle}
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {EN_LANDING.why.map((w) => (
              <article key={w.title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
                <h3 className="text-base font-black text-ink">{w.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-7 text-foreground/65">{w.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Steps ---------- */}
      <section className="bg-ink py-14 text-white sm:py-16" aria-labelledby="en-steps-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="en-steps-h" className="text-2xl font-black sm:text-3xl">
            {EN_LANDING.stepsTitle}
          </h2>
          <ol className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {EN_LANDING.steps.map((s, i) => (
              <li key={s.title} className="relative rounded-3xl border border-white/10 bg-white/5 p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-sm font-black text-ink">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-[15px] font-black text-white">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-7 text-white/65">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Candidate + Cost ---------- */}
      <section className="bg-bone py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
          <article className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-ink/10">
            <h2 className="text-xl font-black text-ink">{EN_LANDING.candidateTitle}</h2>
            <p className="mt-4 text-[13.5px] leading-8 text-foreground/70">{EN_LANDING.candidateDesc}</p>
          </article>
          <article className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-ink/10">
            <h2 className="text-xl font-black text-ink">{EN_LANDING.costsTitle}</h2>
            <p className="mt-4 text-[13.5px] leading-8 text-foreground/70">{EN_LANDING.costsDesc}</p>
            <ul className="mt-4 space-y-2 text-[13px] text-foreground/75">
              {[
                "Written, all-inclusive quote after the online consultation",
                "Hospital, anaesthesia and clinic follow-ups itemized — no hidden fees",
                "Installment-free payment on treatment days",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-teal" />
                  {t}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="bg-bone-2 py-14 sm:py-16" aria-labelledby="en-faq-h">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 id="en-faq-h" className="text-2xl font-black text-ink sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-8 space-y-3">
            {EN_LANDING.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/10 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-[14px] font-black text-ink">
                  {f.q}
                  <ChevronRight size={16} className="shrink-0 text-teal transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-[13px] leading-7 text-foreground/70">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-ink p-8 text-center text-white">
            <p className="text-lg font-black text-gold-soft">Ready for a case review?</p>
            <p className="mx-auto mt-2 max-w-lg text-[13px] leading-7 text-white/70">
              The first step costs nothing: send your imaging and photos, and receive a
              surgical opinion and quote before you decide on travel.
            </p>
            <Link
              href="/en/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-black text-ink transition hover:scale-[1.03] hover:bg-gold-soft"
            >
              Start the consultation <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
