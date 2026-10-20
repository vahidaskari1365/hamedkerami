import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-chrome";
import { JsonLdScript, breadcrumbLd } from "@/components/schema";
import { SITE } from "@/lib/data";
import { ShieldCheck, Stethoscope, AlertTriangle, Database, Eye, UserRoundCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "حریم خصوصی و سلب مسئولیت پزشکی | دکتر حامد کرمانی",
  description:
    "سیاست حریم خصوصی سایت دکتر حامد کرمانی؛ اینکه چه اطلاعاتی جمع‌آوری می‌شود، چگونه محافظت می‌شود و سلب مسئولیت پزشکی محتوای سلامت‌محور سایت.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    id: "collect",
    icon: Database,
    title: "چه اطلاعاتی جمع‌آوری می‌شود؟",
    body: [
      "هنگام استفاده از فرم تماس یا فرم رزرو نوبت، اطلاعاتی که خودتان وارد می‌کنید ذخیره می‌شود؛ شامل نام، شماره تماس، ایمیل (در فرم تماس)، روز و پزشک انتخابی و توضیحی که اختیاری برایمان می‌نویسید. این اطلاعات تنها برای تماس گرفتن، هماهنگی نوبت و پاسخ به پرسش شما استفاده می‌شود و هیچ‌گاه به اشخاص ثالث فروخته یا اجاره داده نمی‌شود.",
      "علاوه بر آن، آمار بازدید سایت به‌صورت تجمیعی ثبت می‌شود؛ یعنی چه صفحاتی بیشتر دیده شده‌اند، از چه شهر یا دستگاهی ورود داشته‌اید و از کدام سایت به ما رسیده‌اید. در این آمار هویت واقعی شما ثبت نمی‌شود و امکان شناسایی فردی وجود ندارد.",
    ],
  },
  {
    id: "use",
    icon: Eye,
    title: "اطلاعات چگونه استفاده می‌شود؟",
    body: [
      "اطلاعات فرم‌ها فقط برای دو هدف استفاده می‌شود: اول، تماس گرفتن برای تأیید و هماهنگی نوبت شما؛ دوم، ثبت تاریخچه مختصری از درخواست‌ها در سامانه داخلی مطب تا همکاران ما در تماس بعدی، دقیق‌تر و سریع‌تر پاسخ بدهند. شماره تماسی که وارد می‌کنید ممکن است برای پیامک یا تماس مرتبط با همان نوبت استفاده شود.",
      "آمار تجمیعی بازدید به ما کمک می‌کند بدانیم کدام محتوای آموزشی برای بیماران مفید است و کدام بخش سایت به بهبود نیاز دارد. مثلاً اگر صفحات مربوط به جراحی فک بیشتر خوانده شود، محتوای همان حوزه را کامل‌تر می‌کنیم. این تصمیم‌ها روی داده‌های بی‌نام و نشان گرفته می‌شود.",
    ],
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "امنیت و نگهداری اطلاعات",
    body: [
      "اطلاعات ثبت‌شده روی سرور اختصاصی همین سایت نگهداری می‌شود و در اختیار دفتر دکتر کرمانی است. ارتباط صفحات سایت با پروتکل امن HTTPS رمزنگاری می‌شود و دسترسی پنل مدیریت فقط با نام کاربری و رمز عبور که به‌صورت هش‌شده ذخیره می‌شوند، امکان‌پذیر است.",
      "درخواست‌های نوبت و پیام‌هایی که بی‌پاسخ می‌مانند، پس از مدتی از سامانه پاک می‌شوند. اگر می‌خواهید اطلاعاتتان حذف شود کافی است با مطب تماس بگیرید؛ درخواست حذف بدون پرسش اضافه اجرا می‌شود.",
    ],
  },
  {
    id: "cookies",
    icon: UserRoundCheck,
    title: "کوکی‌ها و ابزارهای آماری",
    body: [
      "سایت برای اندازه‌گیری بازدید از Google Analytics استفاده می‌کند؛ این سرویس کوکی‌هایی روی مرورگر شما قرار می‌دهد تا بازدیدها بدون ذخیره هویت واقعی شمرده شوند. همچنین نسخه نصب‌شدنی سایت (PWA) برای به‌خاطر سپردن تنظیمات نمایش از حافظه محلی مرورگر استفاده می‌کند.",
      "اگر مایل نیستید در آمار گوگل شمرده شوید، می‌توانید افزونه‌های مسدودکننده رسمی Google Analytics را نصب کنید یا مرورگر را طوری تنظیم کنید که کوکی‌های شخص ثالث را نپذیرد. استفاده از سایت بدون پذیرش این کوکی‌ها هم کاملاً ممکن است و هیچ بخشی برای شما محدود نمی‌شود.",
    ],
  },
  {
    id: "disclaimer",
    icon: AlertTriangle,
    title: "سلب مسئولیت پزشکی — مهم",
    body: [
      "تمام محتوای آموزشی این سایت، از جمله مقالات وبلاگ، صفحات خدمات و پاسخ‌های متداول، صرفاً برای آگاهی عمومی نوشته شده است و جایگزین معاینه حضوری، تشخیص بالینی و نظر تخصصی پزشک نیست. هیچ تصمیم درمانی — از قبیل انجام یا لغو جراحی، شروع دارو یا ترک درمان — نباید تنها بر پایه مطالب این سایت گرفته شود.",
      "نتایج جراحی‌های فک و صورت به عوامل فردی بسیاری مانند ساختار استخوانی، سن، وضعیت سلامت عمومی و رعایت دستورات پس از عمل بستگی دارد؛ بنابراین نتیجه یک بیمار، پیش‌بینی‌ای برای نتیجه بیمار دیگر نیست. تصاویر نمونه‌کارها صرفاً مستند موارد واقعی درمان‌شده‌اند و تضمین نتیجه یکسان محسوب نمی‌شوند.",
      "در موارد اورژانسی مانند ضربه به صورت، خونریزی، تورم شدید یا درد کنترل‌ناپذیر، به‌جای جست‌وجو در اینترنت فوراً به اورژانس بیمارستان یا مطب مراجعه کنید. مسئولیت پیگیری درمان شما بر اساس توصیه حضوری پزشک معالج است، نه محتوای عمومی این وب‌سایت.",
    ],
  },
  {
    id: "contact",
    icon: Stethoscope,
    title: "پرسش درباره این سیاست",
    body: [
      "اگر درباره نحوه جمع‌آوری یا استفاده از اطلاعات پرسشی دارید، یا می‌خواهید اطلاعاتی که از شما ثبت شده را دریافت یا حذف کنید، از صفحه تماس پیام بگذارید یا با شماره مطب تماس بگیرید. پاسخ‌گویی به درخواست‌های مربوط به حریم خصوصی در اولویت کاری دفتر قرار دارد.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <SiteShell>
      <JsonLdScript data={breadcrumbLd([{ name: "حریم خصوصی", path: "/privacy" }])} />

      <header className="bg-ink pb-14 pt-32 text-white sm:pb-16 sm:pt-36">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <Link href="/" className="transition hover:text-teal">خانه</Link>
            <span aria-hidden>/</span>
            <span className="text-white/80">حریم خصوصی و سلب مسئولیت</span>
          </nav>
          <h1 className="mt-6 text-2xl font-black leading-[1.5] sm:text-4xl sm:leading-[1.5]">
            حریم خصوصی و سلب مسئولیت پزشکی
          </h1>
          <p className="mt-4 text-sm leading-8 text-white/70">
            اعتماد شما برایمان مهم‌تر از هر رتبه‌ای در جست‌وجوست. این صفحه به‌روشنی توضیح می‌دهد که
            چه اطلاعاتی در سایت ثبت می‌شود، چگونه از آن محافظت می‌شود و مرزهای مسئولیت پزشکی محتوای
            آموزشی کجاست.
          </p>
        </div>
      </header>

      <article className="bg-bone py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6">
          {SECTIONS.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-28 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/8 sm:p-8"
              aria-labelledby={`h-${s.id}`}
            >
              <h2 id={`h-${s.id}`} className="flex items-center gap-2.5 text-lg font-black text-ink">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
                  <s.icon size={18} />
                </span>
                {s.title}
              </h2>
              <div className="mt-4 space-y-4">
                {s.body.map((p, i) => (
                  <p key={i} className="text-[14.5px] leading-8 text-foreground/75">
                    {p}
                  </p>
                ))}
              </div>
              {s.id === "contact" ? (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link
                    href="/contact"
                    className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-white transition hover:bg-ink-2"
                  >
                    فرم تماس با مطب
                  </Link>
                  <a
                    href={`tel:${SITE.phone}`}
                    dir="ltr"
                    className="rounded-full bg-teal/10 px-5 py-2.5 text-xs font-black text-teal-3 transition hover:bg-teal/20"
                  >
                    {SITE.phoneDisplay}
                  </a>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </SiteShell>
  );
}
