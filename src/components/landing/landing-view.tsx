import {
  LandingHeader,
  LandingHero,
  LandingSection,
  LandingCards,
  LandingSteps,
  LandingFaq,
  LandingReviews,
  LandingCtaBand,
  LandingFooter,
  SITE_INFO,
} from "@/components/landing/landing-chrome";
import { LandingVideos } from "@/components/landing/landing-videos";
import { JsonLdScript, videoLd } from "@/components/schema";
import type { LandingData, LandingSectionData } from "@/lib/landing-defaults";
import type { SiteVideo } from "@/lib/videos";
import { trimReviewBody } from "@/lib/reviews";

/* ============================================================
   LandingPageView — رندر کامل صفحه فرود از داده (دیتابیس/پیش‌فرض)
   + اسکیما JSON-LD (FAQPage + MedicalProcedure + Breadcrumb)
   ============================================================ */

/** نمایش **بولد** داخل پاراگراف‌ها */
function WithBold({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>
      )}
    </>
  );
}

function SectionBody({ s }: { s: LandingSectionData }) {
  return (
    <>
      {s.paragraphs?.map((p, i) => (
        <p key={`p${i}`}>
          <WithBold text={p} />
        </p>
      ))}
      {s.cards && s.cards.length > 0 ? <LandingCards items={s.cards} /> : null}
      {s.steps && s.steps.length > 0 ? <LandingSteps steps={s.steps} /> : null}
      {s.bullets && s.bullets.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {s.bullets.map((b, i) => (
            <li key={`b${i}`} className="flex items-start gap-3">
              <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {s.table && s.table.rows.length > 0 ? (
        <div className="mt-8 overflow-x-auto rounded-3xl ring-1 ring-ink/5">
          <table className="w-full min-w-[540px] text-right text-sm">
            <thead>
              <tr className="bg-ink text-white">
                {s.table.headers.map((h) => (
                  <th key={h} scope="col" className="whitespace-nowrap px-4 py-3.5 font-black">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 1 ? "bg-bone" : "bg-white"}>
                  {row.map((c, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-3.5 leading-7 ${ci === 0 ? "font-bold text-ink" : "text-foreground/70"}`}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {s.image ? (
        <figure className="mt-8 overflow-hidden rounded-3xl ring-1 ring-ink/5">
          <img
            src={s.image}
            alt={s.imageAlt || s.title}
            loading="lazy"
            className="h-auto w-full object-cover"
          />
          {s.imageAlt ? <figcaption className="sr-only">{s.imageAlt}</figcaption> : null}
        </figure>
      ) : null}
      {s.cta ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-teal/10 p-5 ring-1 ring-teal/30">
          <p className="text-sm font-bold text-ink">
            <WithBold text={s.cta} />
          </p>
          <a
            href={`tel:${SITE_INFO.phone}`}
            className="rounded-full bg-teal px-6 py-3 text-xs font-black text-white transition hover:bg-teal-2"
          >
            تماس با مطب: <span dir="ltr">{SITE_INFO.phoneDisplay}</span>
          </a>
        </div>
      ) : null}
    </>
  );
}

export function LandingPageView({
  data,
  url,
  serviceLd,
  reviews = [],
  videos = [],
}: {
  data: LandingData;
  url: string;
  serviceLd: Record<string, unknown>;
  /** بازخورد واقعی بیماران — بدون رکورد، سکشن رندر نمی‌شود */
  reviews?: { name: string; body: string; date: string }[];
  /** ویدیوهای آپارات مرتبط با موضوع صفحه + اسکیمای VideoObject */
  videos?: SiteVideo[];
}) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "https://dr-kermani.com/" },
      { "@type": "ListItem", position: 2, name: data.label, item: url },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
      {/* اسکیمای VideoObject هر ویدیو — شانس نتیجه ویدیویی گوگل (AIO/GEO) */}
      {videos.map((v) => (
        <JsonLdScript key={`ld-video-${v.id}`} data={videoLd(v)} />
      ))}

      <LandingHeader />

      <main className="flex-1">
        <LandingHero
          eyebrow={data.eyebrow}
          h1={data.h1}
          desc={data.heroDesc}
          image={data.heroImage}
          imageAlt={data.heroImageAlt}
        />

        {data.sections.map((s, i) => (
          <LandingSection key={i} title={s.title} alt={i % 2 === 1}>
            <SectionBody s={s} />
          </LandingSection>
        ))}

        {videos.length > 0 ? (
          <LandingSection title="ویدیوهای جراحی دکتر حامد کرمانی" alt={data.sections.length % 2 === 1}>
            <p className="text-sm leading-8 text-foreground/65">
              تصاویر واقعی اتاق عمل و نتیجه پیش و بعد بیماران جراحی فک و چانه و ایمپلنت دندان — بدون تدوین تبلیغاتی. ویدیوهای کامل‌تر در کانال آپارات دکتر کرمانی در دسترس است.
            </p>
            <LandingVideos videos={videos} />
          </LandingSection>
        ) : null}

        {data.faqs.length > 0 ? (
          <LandingSection
            title="سوالات متداول"
            alt={(data.sections.length + (videos.length > 0 ? 1 : 0)) % 2 === 1}
          >
            <LandingFaq items={data.faqs} />
          </LandingSection>
        ) : null}

        {reviews.length > 0 ? (
          <LandingSection
            title="تجربه بیماران دکتر حامد کرمانی"
            alt={(data.sections.length + (videos.length > 0 ? 1 : 0) + (data.faqs.length > 0 ? 1 : 0)) % 2 === 1}
          >
            <p className="text-sm leading-8 text-foreground/65">
              بازخوردهای واقعی بیماران ثبت‌شده در وب‌سایت مطب؛ تجربه‌های مرتبط با جراحی فک، چانه و ایمپلنت از زبان خود بیماران.
            </p>
            <LandingReviews
              reviews={reviews.map((r) => ({ ...r, body: trimReviewBody(r.body) }))}
            />
          </LandingSection>
        ) : null}

        <LandingCtaBand title={data.ctaTitle} desc={data.ctaDesc} />
      </main>

      <LandingFooter related={data.related} />
    </div>
  );
}

export function landingOgImage(data: LandingData) {
  return data.heroImage
    ? [{ url: data.heroImage, alt: data.heroImageAlt || data.label }]
    : undefined;
}
