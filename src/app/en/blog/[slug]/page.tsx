import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, Languages, MessageCircle } from "lucide-react";
import { JsonLdScript } from "@/components/schema";
import { EN_ARTICLES, getEnArticle, EN_ARTICLE_WA } from "@/lib/en-articles";
import { SITE } from "@/lib/data";

/* ============================================================
   /en/blog/[slug] — مقاله‌های انگلیسی توریسم پزشکی (فاز ۸)
   محتوای دستی از src/lib/en-articles.ts (خارج از ایجنت فارسی).
   هر صفحه: H1 = کیورد دقیق، پاسخ مستقیم ۵۰-۹۰ کلمه، جدول/لیست،
   ≥۴ FAQ با FAQPage schema، hreflang fa/en/x-default، سه اسکیما
   (MedicalWebPage + Article + BreadcrumbList).
   ============================================================ */

export function generateStaticParams() {
  return EN_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getEnArticle(slug);
  if (!a) return {};
  return {
    title: { absolute: `${a.title} | Dr. Hamed Kermani` },
    description: a.excerpt,
    alternates: {
      canonical: `/en/blog/${a.slug}`,
      languages: {
        fa: a.fa.href,
        en: `/en/blog/${a.slug}`,
        "x-default": a.xDefaultFa ? a.fa.href : `/en/blog/${a.slug}`,
      },
    },
    openGraph: {
      title: a.title,
      description: a.excerpt,
      url: `${SITE.url}/en/blog/${a.slug}`,
      type: "article",
      publishedTime: a.datePublished,
      modifiedTime: a.dateModified,
      images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: a.title }],
    },
  };
}

export default async function EnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getEnArticle(slug);
  if (!a) notFound();

  const url = `${SITE.url}/en/blog/${a.slug}`;

  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          "@id": `${url}#webpage`,
          url,
          name: a.title,
          description: a.excerpt,
          inLanguage: "en",
          about: { "@id": `${SITE.url}/#physician` },
          audience: { "@type": "Patient" },
          reviewedBy: { "@id": `${SITE.url}/#physician` },
          lastReviewed: a.dateModified,
          significantLink: `${SITE.url}/en/contact`,
        }}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${url}#article`,
          headline: a.title,
          description: a.excerpt,
          inLanguage: "en",
          datePublished: a.datePublished,
          dateModified: a.dateModified,
          author: { "@id": `${SITE.url}/#physician` },
          publisher: { "@id": `${SITE.url}/#physician` },
          mainEntityOfPage: { "@id": `${url}#webpage` },
        }}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: a.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/en` },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/en/blog` },
            { "@type": "ListItem", position: 3, name: a.title, item: url },
          ],
        }}
      />

      {/* ---------- Header ---------- */}
      <header className="relative overflow-hidden bg-ink pb-14 pt-32 text-white sm:pb-16 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(201,161,59,0.14),transparent)]" aria-hidden />
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <Link href="/en" className="transition hover:text-teal">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/en/blog" className="transition hover:text-teal">Blog</Link>
            <span aria-hidden>/</span>
            <span className="text-white/80">{a.keyword}</span>
          </nav>
          <h1 className="mt-5 text-3xl font-black leading-[1.25] sm:text-[2.5rem] sm:leading-[1.2]">
            {a.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/55">
            <span>Dr. Hamed Kermani — Oral &amp; Maxillofacial Surgeon, Craniofacial Fellowship</span>
            <span aria-hidden>·</span>
            <span>{a.readMinutes} min read</span>
            <span aria-hidden>·</span>
            <span>Updated {a.dateModified}</span>
          </div>
          <Link
            href={a.fa.href}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-bold text-white/80 transition hover:bg-white/10"
          >
            <Languages size={13} /> {a.fa.label}
          </Link>
        </div>
      </header>

      {/* ---------- Body ---------- */}
      <article className="bg-bone py-12 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* پاسخ مستقیم — AEO/AI answer box */}
          <div className="rounded-3xl border border-teal/25 bg-teal/5 p-6 sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-widest text-teal">
              Short answer
            </p>
            <p className="mt-2.5 text-[14.5px] leading-8 text-foreground/80">{a.answer}</p>
          </div>

          {a.sections.map((s) => (
            <section key={s.h2} className="mt-10">
              <h2 className="text-xl font-black text-ink sm:text-2xl">{s.h2}</h2>
              {s.paras.map((p, i) => (
                <p key={i} className="mt-4 text-[14px] leading-8 text-foreground/70">
                  {p}
                </p>
              ))}
              {s.list ? (
                <ul className="mt-4 space-y-2">
                  {s.list.map((li) => (
                    <li key={li} className="flex items-start gap-2 text-[13.5px] leading-7 text-foreground/75">
                      <CheckCircle2 size={15} className="mt-1 shrink-0 text-teal" />
                      {li}
                    </li>
                  ))}
                </ul>
              ) : null}
              {s.table ? (
                <div className="mt-5 overflow-x-auto rounded-2xl ring-1 ring-ink/10">
                  <table className="w-full min-w-[480px] border-collapse bg-white text-[13px]">
                    <thead>
                      <tr className="bg-ink text-white">
                        {s.table.head.map((h) => (
                          <th key={h} className="px-4 py-3 text-start font-black">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.table.rows.map((row) => (
                        <tr key={row[0]} className="border-t border-ink/5">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-4 py-3 text-foreground/75">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          ))}

          {/* ---------- FAQ ---------- */}
          <section className="mt-12" aria-labelledby="en-art-faq">
            <h2 id="en-art-faq" className="text-xl font-black text-ink sm:text-2xl">
              Frequently asked questions
            </h2>
            <div className="mt-5 space-y-3">
              {a.faqs.map((f) => (
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
          </section>

          {/* ---------- Related ---------- */}
          <section className="mt-12" aria-labelledby="en-art-related">
            <h2 id="en-art-related" className="text-xl font-black text-ink sm:text-2xl">
              Continue reading
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {a.related.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 text-[13.5px] font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:ring-teal/40"
                  >
                    {r.label}
                    <ChevronRight size={15} className="shrink-0 text-teal" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* ---------- CTA ---------- */}
          <div className="mt-12 rounded-3xl bg-ink p-8 text-center text-white">
            <p className="text-lg font-black text-gold-soft">Get your written plan and quote</p>
            <p className="mx-auto mt-2 max-w-lg text-[13px] leading-7 text-white/70">
              Send your X-rays, CBCT or photos on WhatsApp — the first review is free,
              and the written treatment plan with the exact price follows before you book any travel.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href={EN_ARTICLE_WA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-black text-ink transition hover:scale-[1.03] hover:bg-gold-soft"
              >
                <MessageCircle size={15} /> WhatsApp the clinic
              </a>
              <Link
                href="/en/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Contact page <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
