import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronRight, GraduationCap, MessageCircle, Phone } from "lucide-react";
import { JsonLdScript } from "@/components/schema";
import {
  EN_ABOUT,
  EN_BRAND,
  EN_CLINIC,
  EN_SERVICES,
  EN_STATS,
  EN_SUCCESS,
} from "@/lib/en-content";
import { SITE } from "@/lib/data";

/* ============================================================
   /en — صفحه اصلی انگلیسی (بیمار بین‌المللی + ایرانیان خارج)
   hreflang دوسویه با نسخه فارسی در alternates.languages
   ============================================================ */

export const metadata: Metadata = {
  title: {
    absolute:
      "Dr. Hamed Kermani | Jaw Surgeon & Oral-Maxillofacial Surgeon in Tehran, Iran",
  },
  description:
    "Dr. Hamed Kermani — oral & maxillofacial surgeon and craniofacial fellow in Tehran. Orthognathic jaw surgery, genioplasty, blepharoplasty, dental implants and jaw reconstruction. English-speaking clinic, international patients welcome.",
  alternates: {
    canonical: "/en",
    languages: { fa: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    title: "Dr. Hamed Kermani | Oral & Maxillofacial Surgeon in Tehran",
    description: EN_BRAND.description,
    url: `${SITE.url}/en`,
    locale: "en_US",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: "Dr. Hamed Kermani — Oral & Maxillofacial Surgeon, Tehran" }],
  },
};

export default function EnHomePage() {
  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${SITE.url}/en#webpage`,
          url: `${SITE.url}/en`,
          name: "Dr. Hamed Kermani — Oral & Maxillofacial Surgeon in Tehran, Iran",
          description: EN_BRAND.description,
          inLanguage: "en",
          about: { "@id": `${SITE.url}/#physician` },
          isPartOf: { "@id": `${SITE.url}/#website` },
        }}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/en` },
          ],
        }}
      />

      {/* ---------- Hero ---------- */}
      <header className="relative overflow-hidden bg-ink pb-16 pt-32 text-white sm:pb-20 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,rgba(201,161,59,0.14),transparent)]" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-[11px] font-bold tracking-wide text-gold-soft">
              Oral &amp; Maxillofacial Surgeon — Craniofacial Fellowship
            </p>
            <h1 className="mt-6 text-3xl font-black leading-[1.25] sm:text-5xl sm:leading-[1.2]">
              Function and facial harmony,
              <span className="block text-gold-soft">in the hands of a jaw specialist.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-8 text-white/70 sm:text-[15px]">
              Dr. Hamed Kermani is a board-certified oral &amp; maxillofacial surgeon in
              Tehran with a craniofacial surgery fellowship from Tehran University of
              Medical Sciences — performing orthognathic (single &amp; double jaw) surgery,
              genioplasty, blepharoplasty, dental implants and jaw reconstruction. The
              clinic is used to hosting international patients: you start with an online
              consultation, then travel to Tehran for surgery.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/en/contact"
                className="flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-black text-ink shadow-lg shadow-teal/25 transition hover:scale-[1.03] hover:bg-gold-soft active:scale-95"
              >
                Book a consultation
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/en/jaw-surgery-in-iran"
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Jaw surgery in Iran — patient guide
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/55">
              <a href={`tel:${SITE.phone}`} className="ltr-num flex items-center gap-1.5 font-bold text-white/80 hover:text-gold-soft">
                <Phone size={14} /> {EN_CLINIC.phoneDisplay}
              </a>
              <a href={EN_CLINIC.whatsappText} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white">
                <MessageCircle size={14} /> WhatsApp (international)
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-b from-teal/25 to-transparent blur-xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-white/15 shadow-2xl shadow-black/50">
              <Image
                src="/images/dr-photo.png"
                alt="Dr. Hamed Kermani — Oral & Maxillofacial Surgeon in Tehran"
                width={640}
                height={800}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ---------- آمار ---------- */}
      <section aria-label="Surgical statistics" className="border-b border-ink/8 bg-bone-2 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
          {EN_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-teal-3 sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[11px] font-bold text-foreground/55 sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- خدمات ---------- */}
      <section className="bg-bone py-14 sm:py-18" aria-labelledby="en-services-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-black tracking-widest text-teal-3 uppercase">Services</p>
          <h2 id="en-services-h" className="mt-2 text-2xl font-black text-ink sm:text-3xl">
            Specialized jaw, face &amp; implant surgery
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {EN_SERVICES.map((s) => (
              <article key={s.title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/10 transition hover:shadow-md">
                <h3 className="text-base font-black text-ink">{s.title}</h3>
                <p className="mt-2.5 text-[13px] leading-6 text-foreground/65">{s.desc}</p>
                <ul className="mt-4 space-y-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[12.5px] leading-6 text-foreground/75">
                      <CheckCircle2 size={14} className="mt-1 shrink-0 text-teal" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/en/services" className="inline-flex items-center gap-1 text-sm font-black text-teal-3 hover:underline">
              See all services in detail <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- نرخ موفقیت ---------- */}
      <section className="bg-ink py-14 text-white sm:py-16" aria-labelledby="en-success-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="en-success-h" className="text-2xl font-black sm:text-3xl">
            Measured outcomes, not promises
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {EN_SUCCESS.map((s) => (
              <div key={s.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-4xl font-black text-gold-soft">{s.rate}</p>
                <p className="mt-3 text-sm font-black">{s.title}</p>
                <p className="mt-1.5 text-xs leading-6 text-white/60">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- درباره دکتر ---------- */}
      <section className="bg-bone py-14 sm:py-18" aria-labelledby="en-about-h">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-ink/10 shadow-xl">
            <Image
              src="/images/clinic/dr-portrait.jpg"
              alt="Portrait of Dr. Hamed Kermani at the clinic"
              width={640}
              height={800}
              className="h-auto w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-black tracking-widest text-teal-3 uppercase">About the surgeon</p>
            <h2 id="en-about-h" className="mt-2 text-2xl font-black text-ink sm:text-3xl">
              Fellowship-trained in craniofacial surgery
            </h2>
            <p className="mt-4 text-sm leading-8 text-foreground/70">{EN_ABOUT.intro}</p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {EN_ABOUT.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 rounded-2xl bg-white p-3.5 text-[12.5px] font-semibold leading-6 text-foreground/75 ring-1 ring-ink/8">
                  <GraduationCap size={15} className="mt-0.5 shrink-0 text-teal" />
                  {h}
                </li>
              ))}
            </ul>
            <Link
              href="/en/about"
              className="mt-6 inline-flex items-center gap-1 text-sm font-black text-teal-3 hover:underline"
            >
              Read the full CV <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-bone-2 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-center text-white sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(201,161,59,0.16),transparent)]" aria-hidden />
            <h2 className="text-2xl font-black sm:text-3xl">Planning treatment from abroad?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/70">
              Send your X-rays and photos on WhatsApp — Dr. Kermani reviews your case
              personally and you get a written plan before you book any travel.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/en/contact"
                className="rounded-full bg-teal px-6 py-3 text-sm font-black text-ink transition hover:scale-[1.03] hover:bg-gold-soft"
              >
                Request an appointment
              </Link>
              <a
                href={EN_CLINIC.whatsappText}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold transition hover:bg-white/10"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
