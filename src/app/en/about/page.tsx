import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, CheckCircle2, ChevronRight, GraduationCap, ScrollText } from "lucide-react";
import { JsonLdScript } from "@/components/schema";
import { EN_ABOUT, EN_EDUCATION } from "@/lib/en-content";
import { SITE } from "@/lib/data";

/* ============================================================
   /en/about — رزومه انگلیسی دکتر کرمانی (بیمار بین‌المللی)
   ============================================================ */

export const metadata: Metadata = {
  title: {
    absolute:
      "About Dr. Hamed Kermani — Craniofacial Fellowship-Trained Jaw Surgeon in Tehran",
  },
  description:
    "CV of Dr. Hamed Kermani: oral & maxillofacial surgeon (Mashhad University), craniofacial surgery fellowship (Tehran University), former university assistant professor, 1,200+ jaw surgeries, 20,000+ dental implants and 18 scientific publications.",
  alternates: {
    canonical: "/en/about",
    languages: { fa: "/about", en: "/en/about", "x-default": "/about" },
  },
  openGraph: {
    title: "About Dr. Hamed Kermani — Oral & Maxillofacial Surgeon",
    description:
      "Craniofacial fellowship-trained OMFS surgeon in Tehran — education, international training and surgical track record.",
    url: `${SITE.url}/en/about`,
    type: "profile",
  },
};

export default function EnAboutPage() {
  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${SITE.url}/en/about#webpage`,
          url: `${SITE.url}/en/about`,
          name: "About Dr. Hamed Kermani — CV and surgical background",
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
            { "@type": "ListItem", position: 2, name: "About Dr. Kermani", item: `${SITE.url}/en/about` },
          ],
        }}
      />

      {/* هدر */}
      <header className="bg-ink pb-14 pt-32 text-white sm:pb-16 sm:pt-36">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <Link href="/en" className="transition hover:text-teal">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-white/80">About Dr. Kermani</span>
          </nav>
          <h1 className="mt-6 text-2xl font-black leading-[1.3] sm:text-4xl">
            Dr. Hamed Kermani — <span className="text-gold-soft">Oral &amp; Maxillofacial Surgeon</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/70">
            Craniofacial fellowship · Tehran University of Medical Sciences — the full CV,
            education timeline and surgical track record for international patients and
            referring colleagues.
          </p>
        </div>
      </header>

      {/* بدنه */}
      <div className="bg-bone py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* ستون عکس و گواهی */}
          <aside className="space-y-4">
            <div className="overflow-hidden rounded-[2rem] ring-1 ring-ink/10 shadow-xl">
              <Image
                src="/images/dr-photo.png"
                alt="Dr. Hamed Kermani, oral & maxillofacial surgeon"
                width={640}
                height={800}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="rounded-3xl bg-white p-6 ring-1 ring-ink/10">
              <p className="flex items-center gap-2 text-sm font-black text-ink">
                <ScrollText size={16} className="text-teal" />
                Scientific work
              </p>
              <p className="mt-3 text-[13px] leading-7 text-foreground/70">
                Author of <strong className="text-ink">18 scientific papers</strong> on jaw
                and facial surgery indexed on Google Scholar, and holder of the
                <strong className="text-ink"> EACMFS</strong> (European Association for
                Cranio-Maxillo-Facial Surgery) certificate.
              </p>
            </div>
            <div className="rounded-3xl bg-white p-6 ring-1 ring-ink/10">
              <p className="flex items-center gap-2 text-sm font-black text-ink">
                <Award size={16} className="text-teal" />
                International training
              </p>
              <ul className="mt-3 space-y-2 text-[13px] leading-6 text-foreground/70">
                <li>Shanghai Ninth People&apos;s Hospital — oncology &amp; jaw reconstruction course, China (2019)</li>
                <li>AOCMF advanced courses — Leipzig, Germany (2015) and Finland (2017)</li>
                <li>American OMS re-training course — Istanbul (2019)</li>
                <li>Clinical exposure — Belgium and Germany</li>
              </ul>
            </div>
          </aside>

          {/* ستون متن */}
          <div className="space-y-8">
            <section aria-labelledby="en-bio-h">
              <h2 id="en-bio-h" className="text-xl font-black text-ink sm:text-2xl">Biography</h2>
              <p className="mt-4 text-sm leading-8 text-foreground/75">{EN_ABOUT.intro}</p>
              <p className="mt-4 text-sm leading-8 text-foreground/75">{EN_ABOUT.academic}</p>
              <blockquote className="mt-6 rounded-3xl border-r-4 border-teal bg-white p-6 text-[13.5px] leading-8 text-foreground/80 ring-1 ring-ink/8">
                “{EN_ABOUT.quote}”
              </blockquote>
            </section>

            {/* تحصیلات */}
            <section aria-labelledby="en-edu-h">
              <h2 id="en-edu-h" className="flex items-center gap-2 text-xl font-black text-ink sm:text-2xl">
                <GraduationCap size={20} className="text-teal" />
                Education &amp; academic career
              </h2>
              <ol className="mt-5 space-y-0">
                {EN_EDUCATION.map((e, i) => (
                  <li key={`${e.year}-${e.title}`} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* خط تایم‌لاین */}
                    {i < EN_EDUCATION.length - 1 && (
                      <span className="absolute left-[7px] top-5 h-full w-px bg-teal/25" aria-hidden />
                    )}
                    <span className="relative mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-teal bg-bone" aria-hidden />
                    <div>
                      <p className="text-[11px] font-black tracking-wide text-teal-3">{e.year}</p>
                      <p className="mt-0.5 text-sm font-black text-ink">{e.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-foreground/60">{e.place}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* دستاوردها */}
            <section aria-labelledby="en-highlights-h">
              <h2 id="en-highlights-h" className="text-xl font-black text-ink sm:text-2xl">
                Highlights at a glance
              </h2>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {EN_ABOUT.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 rounded-2xl bg-white p-4 text-[12.5px] font-semibold leading-6 text-foreground/75 ring-1 ring-ink/8">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-teal" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>

            <div className="rounded-3xl bg-ink p-7 text-white">
              <p className="text-lg font-black text-gold-soft">Would you like your case reviewed?</p>
              <p className="mt-2 text-[13px] leading-7 text-white/70">
                Send your imaging and photos through the booking page — Dr. Kermani
                personally reviews every international case before the video consultation.
              </p>
              <Link
                href="/en/contact"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-teal px-5 py-2.5 text-sm font-black text-ink transition hover:scale-[1.03] hover:bg-gold-soft"
              >
                Start the consultation <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
