import Image from "next/image";
import Link from "next/link";

/* ============================================================
   چارچوب مشترک صفحات فرود سئو — سرور رندر، بدون SPA shell
   فوتر چسبیده: min-h-screen flex flex-col + mt-auto
   ============================================================ */

export const SITE_INFO = {
  name: "دکتر حامد کرمانی",
  role: "متخصص جراحی فک و صورت — فلوشیپ جراحی های کرانیوفاسیال",
  phone: "02166921500",
  phoneDisplay: "۰۲۱-۶۶۹۲۱۵۰۰",
  whatsapp: "09382080270",
  whatsappDisplay: "۰۹۳۸-۲۰۸۰۲۷۰",
  address: "تهران، بلوار کشاورز، تقاطع جمالزاده، ساختمان پزشکان کوثر، طبقه ۳ واحد ۱۲",
  hours: "شنبه تا چهارشنبه — ۱۵:۰۰ تا ۱۹:۰۰",
  instagram: "https://www.instagram.com/dr.hamedkermani.omfs/",
};

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="بازگشت به صفحه اصلی">
          <span className="h-11 w-11 overflow-hidden rounded-xl ring-1 ring-white/15">
            <img src="/images/logo.png" alt="لوگوی دکتر حامد کرمانی" className="h-full w-full object-cover" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-black text-white sm:text-base">دکتر حامد کرمانی</span>
            <span className="block text-[11px] text-white/60">متخصص جراحی فک و صورت</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="ناوبری صفحات فرود">
          <a
            href={`tel:${SITE_INFO.phone}`}
            className="hidden rounded-full bg-teal px-5 py-2.5 text-xs font-bold text-white transition hover:bg-teal-2 sm:block"
          >
            رزرو مشاوره: {SITE_INFO.phoneDisplay}
          </a>
          <Link
            href="/"
            className="rounded-full bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
          >
            صفحه اصلی سایت
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function LandingCtaBand({ title, desc }: { title: string; desc: string }) {
  return (
    <section className="bg-teal py-14 text-white" aria-label="درخواست مشاوره">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-white/85 sm:text-base">{desc}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`tel:${SITE_INFO.phone}`}
            className="rounded-full bg-white px-8 py-4 text-sm font-black text-teal-3 shadow-lg transition hover:scale-[1.03]"
          >
            تماس با مطب: {SITE_INFO.phoneDisplay}
          </a>
          <a
            href={`https://wa.me/${SITE_INFO.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-ink px-8 py-4 text-sm font-black text-white shadow-lg transition hover:scale-[1.03]"
          >
            ارسال رادیوگرافی در واتسپ
          </a>
        </div>
        <p className="mt-5 text-xs text-white/70">{SITE_INFO.hours} — پنجشنبه و جمعه تعطیل</p>
      </div>
    </section>
  );
}

export function LandingFooter({ related }: { related: { href: string; label: string }[] }) {
  return (
    <footer className="mt-auto bg-ink text-white/70" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-base font-black text-white">{SITE_INFO.name}</p>
            <p className="mt-2 text-xs leading-7">{SITE_INFO.role}</p>
            <p className="mt-4 text-xs leading-7">سابقه بیش از ۱۶ سال جراحی، ۱۰۶۷ جراحی فک و ۵۰۰۰ ایمپلنت دندان</p>
          </div>
          <div>
            <p className="text-sm font-black text-white">اطلاعات تماس</p>
            <ul className="mt-3 space-y-2 text-xs leading-7">
              <li>تلفن مطب: <a href={`tel:${SITE_INFO.phone}`} className="font-bold text-teal transition hover:text-teal-2" dir="ltr">{SITE_INFO.phoneDisplay}</a></li>
              <li>واتسپ: <a href={`https://wa.me/${SITE_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="font-bold text-teal transition hover:text-teal-2" dir="ltr">{SITE_INFO.whatsappDisplay}</a></li>
              <li>{SITE_INFO.address}</li>
              <li>{SITE_INFO.hours}</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-black text-white">صفحات مرتبط</p>
            <ul className="mt-3 space-y-2 text-xs leading-7">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="transition hover:text-white">{r.label}</Link>
                </li>
              ))}
              <li><Link href="/#/blog" className="transition hover:text-white">وبلاگ آموزشی</Link></li>
              <li><Link href="/#/contact" className="transition hover:text-white">تماس و رزرو نوبت</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-[11px] leading-6 text-white/40">
          مطالب این صفحه جنبه آموزشی دارد و جایگزین معاینه حضوری نیست — تشخیص نهایی با معاینه و تصویربرداری انجام می شود.
        </div>
      </div>
    </footer>
  );
}

export function LandingHero({
  eyebrow,
  h1,
  desc,
  image,
  imageAlt,
}: {
  eyebrow: string;
  h1: string;
  desc: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink" aria-label="معرفی">
      <div className="absolute inset-0 opacity-35">
        <Image src={image} alt={imageAlt} fill priority className="object-cover" sizes="100vw" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-l from-ink via-ink/80 to-ink/40" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="inline-block rounded-full bg-teal/20 px-4 py-1.5 text-xs font-bold text-teal ring-1 ring-teal/40">
          {eyebrow}
        </p>
        <h1 className="mt-6 max-w-3xl text-3xl font-black leading-[1.35] text-white sm:text-4xl sm:leading-[1.4]">
          {h1}
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-8 text-white/70 sm:text-base sm:leading-9">{desc}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href={`tel:${SITE_INFO.phone}`}
            className="rounded-full bg-teal px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-teal/30 transition hover:bg-teal-2"
          >
            رزرو مشاوره: {SITE_INFO.phoneDisplay}
          </a>
          <a
            href="#details"
            className="rounded-full bg-white/10 px-7 py-3.5 text-sm font-black text-white ring-1 ring-white/20 transition hover:bg-white/20"
          >
            اطلاعات کامل
          </a>
        </div>
      </div>
    </section>
  );
}

/** بخش محتوایی استاندارد صفحه فرود */
export function LandingSection({
  title,
  children,
  alt = false,
}: {
  title: string;
  children: React.ReactNode;
  alt?: boolean;
}) {
  return (
    <section id="details" className={alt ? "bg-bone py-16" : "bg-white py-16"} aria-label={title}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="flex items-center gap-3 text-xl font-black text-ink sm:text-2xl">
          <span className="h-3 w-3 shrink-0 rounded-full bg-teal" aria-hidden />
          {title}
        </h2>
        <div className="mt-6 space-y-4 text-[15px] leading-9 text-foreground/75 sm:text-base">
          {children}
        </div>
      </div>
    </section>
  );
}

/** لیست ویژگی / خدمات */
export function LandingCards({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <p className="flex items-center gap-2.5 font-black text-ink">
            <span className="h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />
            {it.title}
          </p>
          <p className="mt-3 text-sm leading-8 text-foreground/65">{it.desc}</p>
        </div>
      ))}
    </div>
  );
}

/** مراحل درمان */
export function LandingSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-8 space-y-5">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-black text-white" aria-hidden>
            {i + 1}
          </span>
          <p className="pt-1.5 text-[15px] leading-8 text-foreground/75">{s}</p>
        </li>
      ))}
    </ol>
  );
}

/** سوالات متداول — details/summary بدون جاوااسکریپت، کاملاً قابل ایندکس */
export function LandingFaq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mt-8 space-y-3">
      {items.map((f) => (
        <details key={f.q} className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5 open:ring-teal/30">
          <summary className="cursor-pointer list-none font-black text-ink marker:hidden">
            <span className="flex items-start justify-between gap-3">
              <span>{f.q}</span>
              <span className="mt-1 text-teal transition group-open:rotate-45" aria-hidden>+</span>
            </span>
          </summary>
          <p className="mt-4 border-t border-ink/5 pt-4 text-sm leading-8 text-foreground/70">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
