import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/schema";
import { EN_COSTS } from "@/lib/en-content";
import { SITE } from "@/lib/data";

/* ============================================================
   /en/costs — لندینگ انگلیسی هزینه جراحی فک در ایران
   کیورد بین‌المللی "jaw surgery cost in Iran" — جدول قیمت
   (AEO) + فاکتورها (GEO) + بیمه + FAQ + CTA رزرو.
   hreflang: fa → /costs
   ============================================================ */

export const metadata: Metadata = {
  title: {
    absolute: "Jaw Surgery Cost in Iran — 2026 Price Table | Dr. Hamed Kermani",
  },
  description:
    "Jaw surgery cost in Iran 2026: price table from 90 million tomans (chin) to 240 million tomans (both jaws + chin) — single jaw, monomax and bimaxillary packages, insurance share, installments and what the quote includes.",
  alternates: {
    canonical: "/en/costs",
    languages: { fa: "/costs", en: "/en/costs", "x-default": "/en/costs" },
  },
  openGraph: {
    title: "Jaw Surgery Cost in Iran — 2026 Price Table | Dr. Hamed Kermani",
    description:
      "Transparent 2026 price table for orthognathic jaw surgery in Iran — written, itemized quotes before any payment.",
    url: `${SITE.url}/en/costs`,
    type: "website",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: "Jaw surgery cost in Iran — price table" }],
  },
};

export default function EnCostsPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: EN_COSTS.faqs.map((f) => ({
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
          "@id": `${SITE.url}/en/costs#webpage`,
          url: `${SITE.url}/en/costs`,
          name: "Jaw Surgery Cost in Iran — 2026 Price Table",
          description: EN_COSTS.heroDesc,
          inLanguage: "en",
          about: { "@id": `${SITE.url}/#physician` },
          audience: { "@type": "Patient" },
          reviewedBy: { "@id": `${SITE.url}/#physician` },
          lastReviewed: "2026-10-26",
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
            { "@type": "ListItem", position: 2, name: "Costs", item: `${SITE.url}/en/costs` },
          ],
        }}
      />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-ink pb-16 pt-36 text-white sm:pb-20 sm:pt-44">
        <span className="aurora-orb left-[-6%] top-[-30%] h-64 w-64 bg-teal/25" aria-hidden />
        <span className="aurora-orb right-[-4%] top-[10%] h-48 w-48 bg-[#c9a13b]/20" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-xs font-black tracking-[0.2em] text-teal-3 uppercase">{EN_COSTS.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{EN_COSTS.h1}</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/65">{EN_COSTS.heroDesc}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/en/contact"
              className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-black text-ink shadow-lg shadow-teal/25 transition hover:scale-[1.03]"
            >
              Get my exact quote
            </Link>
            <Link
              href="/en/jaw-surgery-in-iran"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white/85 transition hover:bg-white/10"
            >
              How the trip works
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-bone py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* ---------- AEO answer box ---------- */}
          <div className="rounded-3xl border border-teal/25 bg-card p-7 shadow-sm sm:p-9">
            <h2 className="text-lg font-black text-foreground sm:text-xl">
              Short answer — jaw surgery cost in Iran (2026)
            </h2>
            <p className="mt-3 text-[15px] leading-8 text-foreground/75">{EN_COSTS.answerBox}</p>
          </div>

          {/* ---------- Price table ---------- */}
          <h2 className="mt-14 text-xl font-black text-foreground sm:text-2xl">{EN_COSTS.tableTitle}</h2>
          <div className="mt-5 overflow-x-auto rounded-3xl ring-1 ring-ink/10">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead className="bg-ink text-white">
                <tr>
                  {EN_COSTS.tableHead.map((h) => (
                    <th key={h} scope="col" className="px-5 py-4 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-card">
                {EN_COSTS.tableRows.map((row, i) => (
                  <tr key={row[0]} className={i % 2 ? "bg-bone/60" : ""}>
                    <th scope="row" className="px-5 py-4 text-left font-bold text-foreground">
                      {row[0]}
                    </th>
                    <td className="px-5 py-4 font-black text-teal-3" dir="ltr">
                      {row[1]}
                    </td>
                    <td className="px-5 py-4 text-foreground/70">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-2xl bg-gold-soft/10 px-5 py-4 text-[13px] leading-7 text-foreground/70">
            {EN_COSTS.tableNote}
          </p>

          {/* ---------- Factors ---------- */}
          <h2 className="mt-14 text-xl font-black text-foreground sm:text-2xl">{EN_COSTS.factorsTitle}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {EN_COSTS.factors.map((f) => (
              <div key={f.title} className="rounded-3xl bg-card p-6 ring-1 ring-ink/10">
                <h3 className="font-black text-foreground">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-7 text-foreground/65">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* ---------- Insurance ---------- */}
          <h2 className="mt-14 text-xl font-black text-foreground sm:text-2xl">{EN_COSTS.insuranceTitle}</h2>
          <p className="mt-4 text-[15px] leading-8 text-foreground/75">{EN_COSTS.insuranceDesc}</p>

          {/* ---------- FAQ ---------- */}
          <h2 className="mt-14 text-xl font-black text-foreground sm:text-2xl">{EN_COSTS.faqTitle}</h2>
          <div className="mt-6 space-y-4">
            {EN_COSTS.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-card ring-1 ring-ink/10 transition open:ring-teal/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-bold text-foreground">
                  {f.q}
                  <span className="text-teal transition group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 text-sm leading-7 text-foreground/70">{f.a}</p>
              </details>
            ))}
          </div>

          {/* ---------- CTA band ---------- */}
          <div className="mt-14 overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-10">
            <h2 className="text-lg font-black">Ready for a written, all-inclusive quote?</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Send your X-rays and photos on WhatsApp — you receive a written treatment plan with a
              transparent price before booking any travel.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/en/contact"
                className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-black text-ink transition hover:scale-[1.03]"
              >
                Book a Visit
              </Link>
              <a
                href="https://wa.me/989382080270"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white/85 transition hover:bg-white/10"
              >
                WhatsApp the clinic
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
