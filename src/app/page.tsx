import type { Metadata } from "next";
import { SiteShell } from "@/components/site-chrome";
import { HomePage } from "@/components/pages/home";

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
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <SiteShell>
      <HomePage />
    </SiteShell>
  );
}
