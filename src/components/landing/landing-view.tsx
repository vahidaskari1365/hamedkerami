import {
  LandingHeader,
  LandingHero,
  LandingSection,
  LandingCards,
  LandingSteps,
  LandingFaq,
  LandingCtaBand,
  LandingFooter,
} from "@/components/landing/landing-chrome";
import type { LandingData, LandingSectionData } from "@/lib/landing-defaults";

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
    </>
  );
}

export function LandingPageView({
  data,
  url,
  serviceLd,
}: {
  data: LandingData;
  url: string;
  serviceLd: Record<string, unknown>;
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

        {data.faqs.length > 0 ? (
          <LandingSection title="سوالات متداول" alt={data.sections.length % 2 === 1}>
            <LandingFaq items={data.faqs} />
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
