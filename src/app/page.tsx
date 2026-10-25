import type { Metadata } from "next";
import { SiteShell } from "@/components/site-chrome";
import { HomePage } from "@/components/pages/home";
import { JsonLdScript, videoLd } from "@/components/schema";
import { VIDEOS } from "@/lib/data";
import { getSiteContent } from "@/lib/site-content";

/* ------------------------------------------------------------
   رندر داینامیک اجباری — دلایل:
   ۱) محتوای سایت (متن‌ها، تصاویر، نمونه‌کارها) از پنل ادمین و روی
      دیتابیس مدیریت می‌شود؛ نسخه‌ی استاتیک/ISR تغییرات ادمین را
      (تا revalidate بعدی) نشان نمی‌داد.
   ۲) روی هاست اشتراکی LiteSpeed + ISR، فایل‌های کش ISR قدیمی روی
      دیسک باقی می‌ماندند و هر دیپلوی، شل کهنه را سرو می‌کرد.
   با force-dynamic هر درخواست از دیتابیس روز رندر می‌شود و
   middleware هم برای HTML پاسخ no-cache می‌فرستد.
   ------------------------------------------------------------ */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { fa: "/", en: "/en", "x-default": "/" },
  },
};

export default async function Page() {
  /* FAQPage فقط همین‌جا — دستورالعمل گوگل: سوال‌های FAQPage باید مرئی
     در همان صفحه باشند. آکاردئون FAQ در HomePage رندر می‌شود و منبع
     داده (getSiteContent) هم همین است — schema و متن مرئی همیشه یکی‌اند (AEO) */
  const { faq } = await getSiteContent();
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <SiteShell>
      {/* اسکیمای ویدئو — هر ویدئویی که در VIDEOS.items اضافه شود
          خودکار VideoObject می‌گیرد (AIO/GEO) */}
      {VIDEOS.items.map((v) => (
        <JsonLdScript key={v.id} data={videoLd(v)} />
      ))}
      {faq.length ? <JsonLdScript data={faqLd} /> : null}
      <HomePage />
    </SiteShell>
  );
}
