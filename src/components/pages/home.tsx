"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Counter,
  FilmGrain,
  LineReveal,
  Marquee,
  Parallax,
  Reveal,
} from "@/components/cinematic";
import { BeforeAfter } from "@/components/before-after";
import { masonryAspect } from "@/components/masonry";
import { Link } from "@/components/hash-router";
import { waLink, KEY_ANSWERS, QUOTE_EN } from "@/lib/data";
import {
  AnimatedShinyText,
  BorderBeam,
  DotPattern,
  MagicCard,
  Particles,
  PulsatingButton,
  ShimmerButton,
  WordRotate,
} from "@/components/magicui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LandingVideos } from "@/components/landing/landing-videos";
import { APARAT_CHANNEL, HIGHLIGHT_VIDEOS } from "@/lib/videos";
import { useContent } from "@/lib/content-context";

/* ================= HERO — Kinpaku lacquer ================= */
function Hero() {
  const { site: SITE, hero: HERO, stats: STATS } = useContent();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100dvh] items-end overflow-hidden bg-ink pb-14 pt-32 text-white sm:pb-20"
      aria-label="معرفی دکتر حامد کرمانی"
    >
      {/* lacquer surgical suite backdrop with Ken Burns */}
      <div className="absolute inset-0" aria-hidden>
        <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
          <div className="kenburns relative h-[115%] w-full">
            <Image
              src={HERO.clinicImage}
              alt="فضای مطب و اتاق عمل دکتر حامد کرمانی"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-55"
            />
          </div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-l from-ink/85 via-ink/20 to-ink/55" />
        <FilmGrain opacity={0.055} />
        {/* Kinpaku aurora orbs */}
        <span className="aurora-orb left-[-8%] top-[8%] h-72 w-72 bg-[#c9a13b]/25" aria-hidden />
        <span
          className="aurora-orb right-[14%] top-[42%] h-56 w-56 bg-[#5c9e8b]/20 [animation-delay:-8s]"
          aria-hidden
        />
        <DotPattern
          className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          dotColor="rgba(233, 207, 135, 0.16)"
          size={26}
        />
        <Particles
          quantity={44}
          color="#e9cf87"
          maxOpacity={0.4}
          className="[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
        />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-end gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* copy */}
        <motion.div style={{ y: textY, opacity: fade }}>
          {/* GEO: ورود با CSS keyframes — بدون استایل opacity:0 اینلاین در HTML سروری */}
          <div
            className="geo-enter-x mb-5 flex items-center gap-3 [animation-delay:0.15s]"
          >
            <span className="h-px w-10 bg-teal" aria-hidden />
            <span className="rounded-full border border-teal/40 bg-teal/10 px-4 py-1.5 text-sm font-semibold text-gold-soft">
              <AnimatedShinyText shinyWidth={140}>
                {HERO.eyebrow}
              </AnimatedShinyText>
            </span>
          </div>

          <h1 className="heading-fluid-1 font-black tracking-tight">
            <LineReveal lines={HERO.headline} startDelay={0.25} />
          </h1>

          <p
            className="geo-enter mt-6 max-w-[58ch] text-base leading-8 text-white/75 sm:text-lg [animation-delay:0.75s]"
          >
            {HERO.name} — {HERO.sub}
          </p>
          <p
            className="geo-enter mt-3 text-lg font-bold text-white/90 sm:text-xl [animation-delay:0.85s]"
          >
            تخصص در {""}
            <WordRotate
              words={[
                "جراحی ارتوگناتیک فک",
                "جراحی دو فک (بایمکس)",
                "بلفاروپلاستی",
                "جنیوپلاستی",
                "ایمپلنت زایگوماتیک",
              ]}
              className="text-teal"
            />
          </p>

          <div
            className="geo-enter mt-9 flex flex-wrap items-center gap-4 [animation-delay:0.9s]"
          >
            <ShimmerButton
              href="/appointment"
              ariaLabel="رزرو نوبت آنلاین — ثبت نوبت و مشاوره"
              className="px-8 py-4 text-base font-bold text-ink shadow-xl shadow-teal/25"
            >
              رزرو نوبت و مشاوره
            </ShimmerButton>
            <Link
              href="/gallery"
              className="rounded-full border border-white/25 px-8 py-4 text-base font-bold text-white/90 backdrop-blur transition hover:border-teal hover:text-teal"
            >
              نمونه جراحی ها
            </Link>
          </div>

          <blockquote
            className="geo-enter-fade mt-10 max-w-[62ch] border-r-2 border-teal/60 pr-5 text-sm leading-7 text-white/60 [animation-delay:1.15s]"
          >
            «{HERO.quote}»
          </blockquote>

          {/* trust strip */}
          <ul
            className="geo-enter mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] text-white/65 [animation-delay:1.3s]"
          >
            {["بورد تخصصی جراحی فک و صورت", "فلوشیپ کرانیوفاسیال — دانشگاه تهران", "بیش از ۱۰۰۰ جراحی موفق"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="text-teal" aria-hidden>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {t}
                </li>
              ),
            )}
          </ul>
        </motion.div>

        {/* doctor portrait */}
        <div className="geo-enter-photo relative mx-auto w-full max-w-[270px] sm:max-w-xs lg:max-w-sm">
          <div className="vignette relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-teal/40">
            <Image
              src={HERO.image}
              alt="دکتر حامد کرمانی، متخصص جراحی فک و صورت"
              fill
              priority
              sizes="(max-width: 640px) 270px, (max-width: 1024px) 330px, 384px"
              className="object-cover object-top"
            />
            <BorderBeam width={2.5} speed={7} />
          </div>
          <div
            className="geo-enter absolute -bottom-5 right-6 left-6 rounded-2xl bg-white/10 p-4 text-center backdrop-blur-xl ring-1 ring-teal/30 [animation-delay:1.4s]"
          >
            <p className="text-sm font-extrabold">دکتر حامد کرمانی</p>
            <p className="mt-0.5 text-[11px] text-white/70">
              فلوشیپ جراحی های کرانیوفیشال — دانشگاه تهران
            </p>
          </div>
          {/* floating gold stat chip */}
          <div
            className="float-y absolute -top-4 -left-3 rounded-2xl border border-teal/40 bg-ink/70 px-4 py-3 text-center backdrop-blur-md sm:-left-6"
            aria-hidden
          >
            <p className="text-xl font-black text-teal">
              <Counter to={1000} suffix="+" />
            </p>
            <p className="text-[10px] text-white/70">جراحی فک و صورت</p>
          </div>
        </div>
      </div>

      {/* scroll hint */}
      <div
        aria-hidden
        className="geo-enter-fade absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 [animation-delay:2s] lg:flex"
      >
        <span className="text-[10px] tracking-widest">SCROLL</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="h-8 w-px bg-gradient-to-b from-teal to-transparent"
        />
      </div>
    </section>
  );
}

/* ================= STATS ================= */
function Stats() {
  const { stats: STATS } = useContent();
  return (
    <section className="relative bg-ink-2 text-white" aria-label="آمار نتایج درمان">
      <Marquee
        items={[
          "جراحی ارتوگناتیک فک",
          "جراحی دو فک (بایمکس)",
          "جنیوپلاستی",
          "بلفاروپلاستی",
          "ایمپلنت زایگوماتیک",
          "بازسازی فک",
          "پروتز مفصل گیجگاهی",
          "سینوس لیفت و GBR",
        ]}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 py-14 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <p className="gold-text text-4xl font-black sm:text-5xl">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-white/65">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================= WHAT IS — definition chunk (GEO/RAG) =================
   ممیزی RAG-chunk readiness: بخش‌های ۱۰۰ تا ۱۵۰ کلمه‌ای با جمله تعریفی
   نرخ استناد AI بالاتری دارند (SE Ranking 2026). این بخش پاسخ مستقیم
   «جراحی فک و صورت چیست» را در همان ابتدای صفحه می‌گذارد. */
function WhatIsSection() {
  return (
    <section className="bg-ink py-20 text-white" aria-label="معرفی جراحی فک و صورت">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-black leading-snug sm:text-3xl">
            جراحی فک و صورت چیست؟
          </h2>
          <p className="mt-6 text-base leading-8 text-white/75 sm:text-lg">
            جراحی فک و صورت (Maxillofacial Surgery) شاخه‌ای تخصصی از علوم پزشکی است که
            تشخیص و درمان جراحی بیماری‌ها، آسیب‌ها و ناهنجاری‌های فک، صورت، جمجمه و
            دهان را بر عهده دارد. این تخصص، زیبایی و عملکرد را هم‌زمان هدف می‌گیرد؛
            یعنی اصلاح ابعاد اسکلتی فک با جراحی ارتوگناتیک و بایمکس، بازکردن تعادل
            پروفایل با جنیوپلاستی، جوان‌سازی نگاه با بلفاروپلاستی و بازسازی دندان‌های
            ازدست‌رفته با ایمپلنت و ایمپلنت زایگوماتیک.
          </p>
          <p className="mt-5 text-base leading-8 text-white/75 sm:text-lg">
            جراحی فک و صورت یک مرحله برنامه‌ریزی دیجیتال دقیق دارد؛ از سی‌تی‌اسکن
            سه‌بعدی و شبیه‌سازی عکس تا طراحی برش استخوانی. انتخاب جراح با تجربه
            فلوشیپ کرانیوفاسیال ریسک عوارض را کم می‌کند و پایداری نتیجه را بالا
            می‌برد. دکتر حامد کرمانی با بیش از ۱۶ سال تجربه آکادمیک و بالینی و
            هزاران جراحی موفق، همه این خدمات را در تهران ارائه می‌کند.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= ABOUT TEASER ================= */
function AboutTeaser() {
  const { services: SERVICES, education: EDUCATION, about: BIO } = useContent();
  return (
    <section className="bg-bone py-24" aria-label="درباره دکتر">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-ink/15 ring-1 ring-ink/10">
            <Parallax speed={0.08} className="h-full w-full">
              <Image
                src="/images/clinic/dr-portrait.jpg"
                alt="عکس دکتر حامد کرمانی، جراح فک و صورت و فلوشیپ کرانیوفاسیال"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </Parallax>
          </div>
          <div className="absolute -bottom-8 -left-2 hidden rounded-2xl bg-ink p-6 text-white shadow-xl ring-1 ring-teal/30 sm:block lg:-left-8">
            <p className="text-3xl font-black text-teal">
              <Counter to={16} suffix="+" />
            </p>
            <p className="mt-1 text-xs text-white/70">سال تجربه جراحی و تدریس</p>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="flex items-center gap-3 text-sm font-bold text-teal-2">
              <span className="h-px w-10 bg-teal" aria-hidden />
              درباره دکتر
            </p>
            <h2 className="mt-4 text-3xl font-black leading-snug sm:text-4xl">
              جراح فک و صورت با فلوشیپ کرانیوفاسیال و سابقه استادی دانشگاه
            </h2>
            <p className="mt-6 max-w-[62ch] text-base leading-8 text-foreground/70">
              {BIO.intro}
            </p>
            <ul className="mt-8 space-y-4">
              {EDUCATION.slice(0, 3).map((e) => (
                <li key={e.title} className="flex items-start gap-4">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-teal" aria-hidden />
                  <div>
                    <p className="font-bold">{e.title}</p>
                    <p className="text-sm text-foreground/60">
                      {e.place} — {e.year}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/about"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-white transition hover:bg-ink-3 hover:text-teal"
            >
              اطلاعات بیشتر درباره دکتر
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M19 12H5m6-6l-6 6 6 6" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= SERVICES — premium light cards ================= */
function ServicesSection() {
  const { services: SERVICES, serviceExtras: SERVICE_EXTRAS } = useContent();
  return (
    <section className="bg-white py-24" aria-label="خدمات">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="flex items-center gap-3 text-sm font-bold text-teal-2">
              <span className="h-px w-10 bg-teal" aria-hidden />
              خدمات ما
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-snug sm:text-4xl">
              از جراحی ارتوگناتیک تا بازسازی کامل فک
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              href="/services"
              className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold transition hover:border-teal hover:text-teal-2"
            >
              مشاهده همه خدمات
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 0.1}>
              <Link
                href="/services"
                aria-label={s.title}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal/20 hover:ring-teal/40"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                  {/* gold index chip */}
                  <span
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-ink/60 text-sm font-black text-teal backdrop-blur-md ring-1 ring-teal/40"
                    aria-hidden
                  >
                    {["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸"][i] ?? i + 1}
                  </span>
                  <p className="absolute bottom-3 right-5 text-[11px] font-bold tracking-wide text-gold-soft" dir="ltr">
                    {s.latin}
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-extrabold transition-colors group-hover:text-teal-2">{s.title}</h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-7 text-foreground/60">
                    {s.desc}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-2">
                    جزئیات خدمت
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden>
                      <path d="M19 12H5m6-6l-6 6 6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-10">
          <div className="grid gap-4 rounded-2xl bg-bone p-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_EXTRAS.map((x) => (
              <MagicCard key={x.title} className="rounded-xl" surface="var(--color-bone)">
                <div className="h-full border-r-2 border-teal/60 py-2 pr-4">
                  <p className="text-sm font-extrabold">{x.title}</p>
                  <p className="mt-1 text-xs leading-6 text-foreground/60">{x.desc}</p>
                </div>
              </MagicCard>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= BLOG TEASER — latest articles ================= */
function BlogTeaser() {
  const { blogPosts: BLOG_POSTS } = useContent();
  const latest = BLOG_POSTS.slice(0, 3);
  if (!latest.length) return null;
  return (
    <section className="bg-bone py-24" aria-label="آخرین مقالات وبلاگ">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="flex items-center gap-3 text-sm font-bold text-teal-2">
              <span className="h-px w-10 bg-teal" aria-hidden />
              وبلاگ آموزشی
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-snug sm:text-4xl">
              آخرین مقالات جراحی فک و صورت
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              href="/blog"
              className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold transition hover:border-teal hover:text-teal-2"
            >
              همه مقالات
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {latest.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.1}>
              <MagicCard className="h-full rounded-3xl" surface="#fffdf7" gradientSize={280}>
                <Link
                  href={`/blog/${p.slug}`}
                  aria-label={`خواندن مقاله: ${p.title}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal/20 hover:ring-teal/40"
                >
                {p.cover ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={p.cover}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent opacity-60" />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                  <span className="w-fit rounded-full bg-teal/10 px-3 py-1 text-xs font-bold text-teal-3">
                    جراحی فک و صورت
                  </span>
                  <h3 className="mt-3 text-base font-black leading-7 transition-colors group-hover:text-teal-2 sm:text-lg">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-7 text-foreground/60">
                    {p.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-2">
                    ادامه مطلب
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden>
                      <path d="M19 12H5m6-6l-6 6 6 6" />
                    </svg>
                  </span>
                </div>
                </Link>
              </MagicCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= نمونه کارها — چیدمان Pinterest ================= */
function PortfolioSection() {
  const { beforeAfter: BEFORE_AFTER, portfolioCovers: PORTFOLIO_COVERS } = useContent();
  const pins = PORTFOLIO_COVERS.slice(0, 10);
  return (
    <section
      className="spotlight-sweep relative overflow-hidden bg-white py-24"
      aria-label="نمونه جراحی های انجام شده"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 text-sm font-bold text-teal-2">
            <span className="h-px w-10 bg-teal" aria-hidden />
            نمونه جراحی های انجام شده
            <span className="h-px w-10 bg-teal" aria-hidden />
          </p>
          <h2 className="mt-4 text-3xl font-black leading-snug sm:text-4xl">
            نتیجه واقعی، در تصاویر واقعی
          </h2>
          <p className="mt-4 text-sm leading-7 text-foreground/60">
            هر کارت، یک نتیجه واقعی از جراحی های انجام شده است — روی کارت کلیک کنید
            تا در گالری کامل بزرگ تر ببینید.
          </p>
        </Reveal>

        {/* کارت های آبشاری به سبک پینترست — ارتفاع های متنوع */}
        <div className="mt-14 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-5 [&>*]:mb-3 sm:[&>*]:mb-4">
          {pins.map((c, i) => (
            <Reveal key={c.src} delay={(i % 5) * 0.05}>
              <Link
                href="/gallery"
                aria-label={`${c.title} — مشاهده در گالری`}
                className={`group relative block ${masonryAspect(i)} cursor-pointer overflow-hidden rounded-xl bg-bone-2 shadow-md ring-1 ring-ink/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-teal/40`}
              >
                <Image
                  src={c.src}
                  alt={`${c.title} — نمونه کار جراحی فک و صورت دکتر کرمانی`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-90 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <span className="absolute bottom-0 right-0 left-0 block p-3 text-[11px] font-extrabold leading-5 text-white">
                  {c.title}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* مقایسه تعاملی قبل و بعد */}
        <Reveal className="mx-auto mt-16 max-w-2xl">
          <BeforeAfter
            before={BEFORE_AFTER.bimax.before}
            after={BEFORE_AFTER.bimax.after}
            label={`${BEFORE_AFTER.bimax.label} — دکتر حامد کرمانی`}
          />
          <p className="mt-4 text-center text-xs leading-6 text-foreground/50">
            دستگیره وسط تصویر را به طرفین بکشید تا تفاوت قبل و بعد از جراحی را
            ببینید.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-12 text-center">
          <Link
            href="/gallery"
            className="inline-block rounded-full bg-teal px-8 py-4 text-sm font-bold text-ink shadow-lg shadow-teal/30 transition hover:bg-teal-2 hover:text-white"
          >
            مشاهده گالری کامل
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= FAQ (AEO) ================= */
function FaqSection() {
  const { site: SITE, faq: FAQ } = useContent();
  return (
    <section className="bg-white py-24" aria-label="سوالات متداول">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="flex items-center gap-3 text-sm font-bold text-teal-2">
            <span className="h-px w-10 bg-teal" aria-hidden />
            سوالات متداول
          </p>
          <h2 className="mt-4 text-3xl font-black leading-snug sm:text-4xl">
            پاسخ پرتکرارترین سوالات شما
          </h2>
          <p className="mt-5 max-w-[52ch] text-base leading-8 text-foreground/70">
            اگر پاسخ سوال خود را پیدا نکردید، در تمام ایام هفته می توانید با مطب
            تماس بگیرید یا از طریق واتسپ پیام دهید تا تیم ما راهنمایی تان کند.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href={`tel:${SITE.phone}`} className="rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-white transition hover:bg-ink-3">
              تماس با مطب
            </a>
            <a href={waLink(SITE.whatsapp)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-ink/15 px-7 py-3.5 text-sm font-bold transition hover:border-teal hover:text-teal-2">
              پیام در واتسپ
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <Accordion type="single" collapsible className="space-y-4">
            {FAQ.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl border border-ink/10 bg-card px-6 shadow-sm"
              >
                <AccordionTrigger className="text-right text-base font-bold leading-7 hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-8 text-foreground/70">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= Journey (SXO + GEO) — مسیر درمان گام به گام ================= */
function JourneySection() {
  const { site: SITE } = useContent();
  const steps = [
    {
      t: "مشاوره و معاینه",
      d: "بررسی چهره و گاز گرفتن، رادیوگرافی و گفت‌وگوی صریح دربارهٔ نتیجهٔ واقع‌بینانه. مطب شنبه تا چهارشنبه ۱۵ تا ۱۹ فعال است؛ تماس یا پیام واتساپ کافی است.",
    },
    {
      t: "برنامه‌ریزی دیجیتال سه‌بعدی",
      d: "بر پایهٔ سی‌تی‌اسکن، مسیر جراحی پیش از عمل شبیه‌سازی می‌شود؛ بیمار پیش از اتاق عمل می‌داند دقیقاً چه تغییری در فک و صورتش رخ می‌دهد.",
    },
    {
      t: "آماده‌سازی با ارتودنسی",
      d: "برای تثبیت نتیجه، جراحی همیشه با درمان ارتودنسی پیش و پس از عمل همراه است؛ مدت آن بسته به پروندهٔ هر بیمار متفاوت است.",
    },
    {
      t: "عمل در بیمارستان",
      d: "جراحی ارتوگناتیک با بیهوشی عمومی و بستری کوتاه انجام می‌شود؛ در جراحی دو فک، فک بالا با استئوتومی ليفورت I و فک پایین با BSSO جابه‌جا می‌شود.",
    },
    {
      t: "نقاهت و پیگیری",
      d: "بیشتر بیماران پس از ۲ هفته به زندگی عادی برمی‌گردند و تورم اصلی در ۳ تا ۴ هفته فروکش می‌کند؛ پیگیری تا تثبیت کامل نتیجه ادامه دارد.",
    },
  ];
  return (
    <section className="bg-bone py-24" aria-label="مسیر درمان گام به گام">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <p className="flex items-center gap-3 text-sm font-bold text-teal-2">
            <span className="h-px w-10 bg-teal" aria-hidden />
            مسیر درمان
          </p>
          <h2 className="mt-4 text-3xl font-black leading-snug sm:text-4xl">
            مسیر درمان جراحی فک و صورت چگونه است؟ گام به گام تا نتیجهٔ نهایی
          </h2>
          <p className="mt-5 max-w-[60ch] text-base leading-8 text-foreground/70">
            اگر برای اولین بار جراحی ارتوگناتیک یا ایمپلنت دندان را جدی گرفته‌اید،
            کل مسیر همین پنج گام است؛ بدون ابهام و بدون گام‌های پنهان.
          </p>
        </Reveal>
        <ol className="mt-10 space-y-4">
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.04}>
              <li className="flex gap-4 rounded-2xl border border-ink/10 bg-card p-5 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/10 text-base font-black text-teal-2" aria-hidden>
                  {["۱", "۲", "۳", "۴", "۵"][i]}
                </span>
                <div>
                  <h3 className="text-base font-black leading-7 sm:text-lg">{s.t}</h3>
                  <p className="mt-1.5 text-sm leading-8 text-foreground/70">{s.d}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal delay={0.1}>
          <p className="mt-8 rounded-2xl border border-teal/20 bg-white p-5 text-sm leading-8 text-foreground/75">
            <strong className="font-black text-teal-2">TL;DR —</strong> مشاوره، سی‌تی‌اسکن و برنامه‌ریزی سه‌بعدی، ارتودنسی آماده‌سازی، عمل ارتوگناتیک در بیمارستان (ليفورت I و BSSO) و پیگیری نقاهت دو هفته‌ای؛ برای شروع همین امروز، رزرو نوبت با شماره {""}
            <a href={`tel:${SITE.phone}`} className="font-bold text-teal-2 underline decoration-teal/40 underline-offset-4">۰۹۳۸-۲۰۸۰۲۷۰</a>
            {" "}یا <a href={waLink(SITE.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-bold text-teal-2 underline decoration-teal/40 underline-offset-4">پیام واتساپ</a>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= CTA — golden silk backdrop ================= */
function CtaSection() {
  const { site: SITE } = useContent();
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-white" aria-label="تماس با ما">
      <div
        aria-hidden
        className="absolute inset-0 bg-[url(/images/hero-lacquer-2.jpg)] bg-cover bg-center opacity-45"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-l from-ink via-ink/70 to-ink/85" />
      <FilmGrain opacity={0.06} />
      <span className="aurora-orb left-[10%] bottom-[-20%] h-64 w-64 bg-[#c9a13b]/20" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-black leading-snug sm:text-4xl">
            مسیر درمان شما از یک <span className="gold-text">مشاوره ساده</span> شروع می شود
          </h2>
          <p className="mx-auto mt-5 max-w-[58ch] text-base leading-8 text-white/80">
            مشاوره تلفنی در تمام ایام هفته پاسخگوی شماست. برای رزرو نوبت یا
            ارسال عکس رادیوگرافی و دریافت نظر اولیه، همین حالا تماس بگیرید.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <PulsatingButton
              href={`tel:${SITE.phone}`}
              ariaLabel={`تماس با مطب — ${SITE.phoneDisplay}`}
              className="bg-teal px-9 py-4 text-base font-black text-ink shadow-xl transition hover:bg-gold-soft"
            >
              <span dir="ltr">{SITE.phoneDisplay}</span>
            </PulsatingButton>
            <Link
              href="/contact"
              className="rounded-full border border-white/40 px-9 py-4 text-base font-bold transition hover:bg-white/10"
            >
              اطلاعات تماس و آدرس مطب
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= KEY ANSWERS — هستهٔ دوزبانهٔ AEO/GEO/AIO =================
   ممیزی SeoMods (۲۰۲۶/۱۱/۰۳) روی صفحهٔ اصلی: AEO ۵۵، Entity ۱۹، Citation ۸۰.
   علت ریشه‌ای: ابزارها فقط توکن لاتین می‌شمارند و «؟» فارسی را علامت سؤال
   نمی‌شناسند؛ پس تیتر سؤالی، تعریف، نقل‌قول و TL;DR همه «صفر» دیده شده بودند.
   این بخش برای بیمار فارسی‌زبان محتوای واقعی می‌دهد و برای موتورهای پاسخ،
   ساختار دوزبانهٔ قابل‌استناد — بدون هیچ ادعای جدید: همهٔ اعداد از
   BIO/STATS/EDUCATION/JAW_COSTS همین سایت آمده است. */
function KeyAnswersSection() {
  const { jawCosts } = useContent();
  return (
    <section
      id="key-answers"
      className="scroll-mt-24 bg-white py-24"
      aria-label="پاسخ سوال‌های کلیدی درباره جراحی فک و صورت"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-black leading-snug sm:text-3xl">
            پاسخ سوال‌های کلیدی شما درباره جراحی فک و صورت
            <span dir="ltr" className="mt-2 block text-base font-bold text-teal-2 sm:text-lg">
              Key Questions About Jaw &amp; Maxillofacial Surgery in Tehran
            </span>
          </h2>
        </Reveal>

        {/* TL;DR — پاسخ کوتاه (AEO: quick-answer block) */}
        <Reveal delay={0.08}>
          <div className="mt-9 rounded-3xl border border-teal/25 bg-teal/[0.04] p-6 sm:p-8">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-base font-black text-teal-2">
              <span>پاسخ کوتاه</span>
              <span dir="ltr" className="rounded-full bg-teal/10 px-3 py-1 text-xs font-bold tracking-wide">
                TL;DR — Key Takeaways
              </span>
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-foreground/80 sm:text-[15px]">
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />
                <span>جراحی فک و صورت (OMFS) تخصص اصلاح فک، صورت و جمجمه است؛ از جراحی ارتوگناتیک و بایمکس تا جنیوپلاستی، بلفاروپلاستی، ایمپلنت دندان و بازسازی فک.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />
                <span>دکتر حامد کرمانی: تخصص OMFS از دانشگاه علوم پزشکی مشهد (۱۳۸۹)، فلوشیپ کرانیوفاسیال از دانشگاه علوم پزشکی تهران (۱۳۹۷)، استادیار دانشگاه‌های شهید بهشتی و مشهد.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />
                <span>سابقهٔ عمل: بیش از ۲۰,۰۰۰ ایمپلنت، ۱,۲۰۰ جراحی ارتوگناتیک، ۱۰۰ ایمپلنت زایگوماتیک، ۳۰ تعویض مفصل فک — پروانهٔ نظام پزشکی ۹۵۳۰۳.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />
                <span>مطب: تهران، بلوار کشاورز، تقاطع جمالزاده، ساختمان پزشکان کوثر — شنبه تا چهارشنبه ۱۵:۰۰ تا ۱۹:۰۰ — رزرو: ۰۹۳۸-۲۰۸۰۲۷۰.</span>
              </li>
            </ul>
            <p dir="ltr" className="mt-6 border-t border-teal/15 pt-5 text-left text-[13px] leading-6 text-foreground/65">
              TL;DR — Dr. Hamed Kermani is a board-certified oral &amp; maxillofacial surgeon (OMFS) in Tehran, Iran, with a craniofacial fellowship from Tehran University of Medical Sciences. His Tehran clinic covers orthognathic (single-jaw and bimaxillary) surgery, genioplasty, blepharoplasty, dental and zygomatic implants, and jaw reconstruction — 20,000+ implants and 1,200+ orthognathic surgeries performed. Address: Keshavarz Blvd, Jamalzadeh crossing, Tehran. Phone / WhatsApp: +98 938 208 0270.
            </p>
            <blockquote dir="ltr" className="mt-4 text-left text-[13px] italic leading-6 text-foreground/60">
              {QUOTE_EN}
            </blockquote>
          </div>
        </Reveal>

        {/* فهرست پرسش‌ها — لنگرهای پرش (SXO): انسان اسکن می‌کند و یک‌ضرب به پاسخ
            موردنظر می‌پرد؛ برای موتورهای پاسخ هم نقشهٔ لنگردار سؤال‌ها شفاف‌تر می‌شود.
            کلیک روی هر آیتم، آکاردئون بسته را هم باز می‌کند. */}
        <Reveal delay={0.12}>
          <nav aria-label="فهرست پرسش‌های کلیدی" className="mt-8 flex flex-wrap gap-2.5">
            {KEY_ANSWERS.map((item, i) => (
              <a
                key={item.en}
                href={`#qa-${i + 1}`}
                onClick={(e) => {
                  const el = document.getElementById(`qa-${i + 1}`);
                  const btn = el?.querySelector("button");
                  if (btn && btn.getAttribute("data-state") !== "open") btn.click();
                  e.preventDefault();
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-full border border-ink/10 bg-bone px-4 py-2 text-[13px] font-bold text-foreground/75 transition hover:border-teal/50 hover:text-teal-2"
              >
                {item.q}
              </a>
            ))}
          </nav>
        </Reveal>

        {/* Q&A دوزبانه — SXO-safe AEO: تیتر سؤالی (؟ انگلیسی) همیشه نمایان؛
            پاسخ‌ها پشت آکاردئون Radix اما محتوا در SSR/DOM باقی می‌ماند (attribute
            hidden فقط نمایش را جمع می‌کند، نه HTML را) → خزندهٔ LLM و گوگل همان
            متن قبلی را می‌بینند و نمرهٔ AEO/GEO/AIO دست‌نخورده می‌ماند؛ ارتفاع بصری
            بخش ~۶۰٪ کم می‌شود (قبل از خدمات، دیوارِ متن نداریم). پرسش اول (تعریف)
            پیش‌فرض باز است. */}
        <Reveal delay={0.16}>
          <Accordion type="single" collapsible defaultValue="qa-1" className="mt-10 space-y-3.5">
            {KEY_ANSWERS.map((item, i) => (
              <AccordionItem
                key={item.en}
                value={`qa-${i + 1}`}
                id={`qa-${i + 1}`}
                className="scroll-mt-24 rounded-2xl border border-ink/10 bg-card px-5 shadow-sm sm:px-6"
              >
                <AccordionTrigger className="text-right hover:no-underline">
                  <span className="text-right">
                    <span className="block text-[15px] font-black leading-7 sm:text-lg">{item.q}</span>
                    <span dir="ltr" className="mt-1 block text-left text-xs font-bold text-teal-2 sm:text-sm">
                      {item.en}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm">
                  <p className="max-w-[70ch] text-[15px] leading-8 text-foreground/75">{item.a}</p>
                  <p dir="ltr" className="mt-3 max-w-[70ch] border-t border-ink/5 pt-3 text-left text-[13px] leading-6 text-foreground/55">
                    {item.enA}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>

        {/* جدول تعرفه — AEO: tables/definition lists */}
        <Reveal>
          <div className="mt-14 overflow-hidden rounded-3xl border border-ink/10 shadow-sm">
            <table className="w-full text-right text-sm">
              <caption className="bg-ink px-5 py-4 text-right font-bold text-white">
                تعرفه جراحی‌های فک و صورت — ۱۴۰۵ (تومان)
                <span dir="ltr" className="mt-0.5 block text-left text-xs font-medium text-white/60">
                  Jaw surgery prices — Tehran, 2026 (Iranian Toman)
                </span>
              </caption>
              <thead>
                <tr className="bg-bone text-foreground">
                  <th scope="col" className="px-5 py-3.5 font-black">نوع جراحی</th>
                  <th scope="col" className="px-5 py-3.5 font-black">تعرفه</th>
                </tr>
              </thead>
              <tbody>
                {jawCosts.map((c) => (
                  <tr key={c.item} className="border-t border-ink/10 transition-colors odd:bg-white even:bg-bone/40">
                    <th scope="row" className="px-5 py-3.5 text-right font-bold">{c.item}</th>
                    <td className="px-5 py-3.5 text-foreground/75">{c.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-6 text-foreground/50">
            تعرفه‌ها تقریبی است و هزینهٔ نهایی پس از معاینه و برنامه‌ریزی اعلام می‌شود — فهرست کامل:{" "}
            <Link href="/costs" className="font-bold text-teal-2 underline decoration-teal/40 underline-offset-4 hover:text-teal">
              تعرفه کامل جراحی فک و ایمپلنت
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= ویدیوهای جراحی — پلیر واقعی در صفحه =================
   دقیقاً همان ۳ ویدیوی HIGHLIGHT_VIDEOS که: ۱) VideoObject همین‌ها
   در page.tsx تزریق می‌شود، ۲) در video-sitemap.xml زیر «/» ثبت شده‌اند.
   مارک‌آپ ↔ محتوای صفحه ↔ sitemap باید یکی باشد وگرنه گوگل در گزارش
   «ویدیو» خطای Affected pages می‌دهد. */
function VideosSection() {
  return (
    <section className="bg-white py-24" aria-label="فیلم های جراحی">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="flex items-center justify-center gap-3 text-sm font-bold text-teal-2">
            <span className="h-px w-10 bg-teal" aria-hidden />
            فیلم های جراحی
            <span className="h-px w-10 bg-teal" aria-hidden />
          </p>
          <h2 className="mt-4 text-3xl font-black leading-snug sm:text-4xl">
            تصاویر واقعی اتاق عمل و نتایج بیماران
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-foreground/70">
            فیلم های جراحی دو فک، جنیوپلاستی و ایمپلنت — بدون تدوین تبلیغاتی؛
            ویدیوهای کامل تر در کانال آپارات دکتر کرمانی در دسترس است.
          </p>
        </Reveal>
        <Reveal className="mt-12 text-right">
          <LandingVideos videos={HIGHLIGHT_VIDEOS} />
        </Reveal>
        <Reveal>
          <a
            href={APARAT_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-9 py-4 text-sm font-bold text-white transition hover:bg-ink-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13l11-6.5L8 5.5z" />
            </svg>
            مشاهده کانال آپارات
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= PAGE ================= */
/* Money-pages strip — لینک ایکویتی به ۵ صفحه پول (roadmap سئو) */
function MoneyPagesSection() {
  const links = [
    { href: "/best-jaw-surgeon-tehran", label: "بهترین دکتر جراحی فک و صورت تهران" },
    { href: "/costs", label: "تعرفه کامل جراحی فک و ایمپلنت" },
    { href: "/jaw-surgery", label: "هزینه جراحی فک (ارتوگناتیک)" },
    { href: "/dental-implant", label: "هزینه ایمپلنت دندان به تفکیک برند" },
    { href: "/chin-surgery", label: "هزینه جنیوپلاستی و جراحی چانه" },
    { href: "/services", label: "تعرفه دندان عقل و جراحی های دیگر" },
  ];
  return (
    <section className="bg-ink py-14" aria-label="تعرفه خدمات و هزینه ها">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-center text-xl font-black text-white sm:text-2xl">
            تعرفه و <span className="gold-text">هزینه جراحی ها</span> — شفاف و بدون مکفی
          </h2>
          <nav aria-label="لینک صفحات تعرفه" className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-[#c9a13b]/35 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white/85 transition hover:border-[#c9a13b]/70 hover:bg-[#c9a13b]/10 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </Reveal>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <WhatIsSection />
      <KeyAnswersSection />
      <AboutTeaser />
      <ServicesSection />
      <PortfolioSection />
      <BlogTeaser />
      <VideosSection />
      <MoneyPagesSection />
      <FaqSection />
      <JourneySection />
      <CtaSection />
    </>
  );
}
