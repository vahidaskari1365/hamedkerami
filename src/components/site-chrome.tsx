/* ============================================================
   SiteShell — چارچوب مشترک صفحات واقعی سایت (App Router)
   شامل: Provider محتوای دیتابیس، نوار بالا، فوتر، داک شناور
   تماس، ثبت آمار بازدید و ریدایرکت لینک‌های هش قدیمی.
   (جایگزین AppShell هش‌محور — برای سئو همه صفحات URL واقعی دارند)

   AEO/GEO/SXO: محتوای دیتابیس در همان رندر سروری خوانده و به
   ContentProvider پاس داده می‌شود تا HTML اولیه (قبل از هیدریشن)
   شامل لیست مقالات و محتوای واقعی باشد — خزنده‌های بدون
   جاوااسکریپت (موتورهای پاسخ‌محور) دیگر fallback ثابت نمی‌بینند.
   ============================================================ */

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollProgress, CinemaIntro } from "@/components/cinematic";
import { PwaTabbar } from "@/components/pwa-tabbar";
import { PwaInstallPill } from "@/components/pwa-install-pill";
import { ContactDock } from "@/components/contact-dock";
import { LegacyHashRedirect } from "@/components/hash-router";
import { ContentProvider } from "@/lib/content-context";
import { HtmlLang } from "@/components/html-lang";
import { Tracker } from "@/components/tracker";
import { getSiteContent } from "@/lib/site-content";

/* ============================================================
   مُهر تازگی محتوا — کامپوننت سروری
   ممیزی GEO (G-DATES گوگل + signals freshness): تاریخ به‌روزرسانی
   باید هم در اسکیما (dateModified) و هم به‌صورت قابل‌مشاهده با
   <time datetime> روی صفحه باشد. چون Footer کلاینت است، المان
   سروری آماده به‌عنوان prop پاس داده می‌شود (بدون mismatch).
   ============================================================ */
function FreshnessStamp({ iso }: { iso: string | null }) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const fa = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(d);
  return (
    <p className="text-xs text-white/50">
      آخرین به‌روزرسانی محتوا:{" "}
      <time dateTime={iso} className="text-white/70">
        {fa}
      </time>
    </p>
  );
}

export async function SiteShell({ children }: { children: React.ReactNode }) {
  /* محتوای زنده دیتابیس برای رندر سروری — خطا داخل تابع مدیریت می‌شود */
  const content = await getSiteContent();

  return (
    <ContentProvider initialContent={content}>
      <HtmlLang lang="fa" dir="rtl" />
      <LegacyHashRedirect />
      <div className="flex min-h-screen flex-col">
        <CinemaIntro />
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer freshness={<FreshnessStamp iso={content.lastUpdated ?? null} />} />
        <ContactDock />
        <PwaInstallPill />
        <PwaTabbar />
        <Tracker />
      </div>
    </ContentProvider>
  );
}
