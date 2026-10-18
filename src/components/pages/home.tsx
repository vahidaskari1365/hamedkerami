"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Counter,
  LineReveal,
  Marquee,
  Parallax,
  Reveal,
} from "@/components/cinematic";
import { BeforeAfter } from "@/components/before-after";
import { Link } from "@/components/hash-router";
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
import { useContent } from "@/lib/content-context";

/* ================= HERO ================= */
function Hero() {
  const { site: SITE, hero: HERO, stats: STATS } = useContent();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100dvh] items-end overflow-hidden bg-ink pb-16 pt-32 text-white sm:pb-20"
      aria-label="معرفی دکتر حامد کرمانی"
    >
      {/* clinic backdrop with Ken Burns */}
      <div className="absolute inset-0" aria-hidden>
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <div className="kenburns relative h-[115%] w-full">
            <Image
              src={HERO.clinicImage}
              alt="فضای مطب و اتاق عمل دکتر حامد کرمانی"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-35"
            />
          </div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-l from-ink/80 via-transparent to-ink/40" />
        <DotPattern
          className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          dotColor="rgba(94, 234, 212, 0.14)"
          size={26}
        />
        <Particles
          quantity={48}
          color="#5eead4"
          maxOpacity={0.4}
          className="[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
        />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-end gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* copy */}
        <motion.div style={{ y: textY, opacity: fade }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-5 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-teal" aria-hidden />
            <span className="rounded-full border border-teal/35 bg-teal/10 px-4 py-1.5 text-sm font-semibold text-teal">
              <AnimatedShinyText shinyWidth={140}>
                {HERO.eyebrow}
              </AnimatedShinyText>
            </span>
          </motion.div>

          <h1 className="heading-fluid-1 font-black tracking-tight">
            <LineReveal lines={HERO.headline} startDelay={0.25} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75 }}
            className="mt-6 max-w-[58ch] text-base leading-8 text-white/75 sm:text-lg"
          >
            {HERO.name} — {HERO.sub}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85 }}
            className="mt-3 text-lg font-bold text-white/90 sm:text-xl"
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
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <ShimmerButton
              href={`tel:${SITE.phone}`}
              ariaLabel="رزرو نوبت و مشاوره — تماس با مطب"
              className="px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal/30"
            >
              رزرو نوبت و مشاوره
            </ShimmerButton>
            <Link
              href="/gallery"
              className="rounded-full border border-white/25 px-8 py-4 text-base font-bold text-white/90 backdrop-blur transition hover:border-teal hover:text-teal"
            >
              نمونه جراحی ها
            </Link>
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.15 }}
            className="mt-10 max-w-[62ch] border-r-2 border-teal/60 pr-5 text-sm leading-7 text-white/60"
          >
            «{HERO.quote}»
          </motion.blockquote>
        </motion.div>

        {/* doctor portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 1.08, x: -30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[270px] sm:max-w-xs lg:max-w-sm"
        >
          <div className="vignette relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-white/15">
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
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute -bottom-5 right-6 left-6 rounded-2xl bg-white/10 p-4 text-center backdrop-blur-xl ring-1 ring-white/20"
          >
            <p className="text-sm font-extrabold">دکتر حامد کرمانی</p>
            <p className="mt-0.5 text-[11px] text-white/70">
              فلوشیپ جراحی های کرانیوفیشال — دانشگاه تهران
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* scroll hint */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 lg:flex"
      >
        <span className="text-[10px] tracking-widest">SCROLL</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="h-8 w-px bg-gradient-to-b from-teal to-transparent"
        />
      </motion.div>
    </section>
  );
}

/* ================= STATS ================= */
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
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 py-14 sm:px-6 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <p className="text-4xl font-black text-teal sm:text-5xl">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-white/65">{s.label}</p>
          </Reveal>
        ))}
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
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-ink/15">
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
          <div className="absolute -bottom-8 -left-2 hidden rounded-2xl bg-ink p-6 text-white shadow-xl sm:block lg:-left-8">
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
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-white transition hover:bg-ink-3"
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

/* ================= SERVICES ================= */
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
                className="group relative block overflow-hidden rounded-2xl bg-ink text-white"
                aria-label={s.title}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
                </div>
                <div className="relative p-6 pt-2">
                  <p className="text-[11px] tracking-wide text-teal" dir="ltr">
                    {s.latin}
                  </p>
                  <h3 className="mt-1 text-xl font-extrabold">{s.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-white/65">
                    {s.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal opacity-0 transition-all duration-300 group-hover:opacity-100">
                    جزئیات خدمت
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
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
                <div className="h-full border-r-2 border-teal/50 py-2 pr-4">
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

/* ================= BEFORE / AFTER ================= */
function BeforeAfterSection() {
  const { beforeAfter: BEFORE_AFTER } = useContent();
  return (
    <section className="spotlight-sweep relative overflow-hidden bg-white py-24" aria-label="نمونه جراحی های انجام شده">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 text-sm font-bold text-teal">
            <span className="h-px w-10 bg-teal" aria-hidden />
            نمونه جراحی های انجام شده
            <span className="h-px w-10 bg-teal" aria-hidden />
          </p>
          <h2 className="mt-4 text-3xl font-black leading-snug sm:text-4xl">
            نتیجه واقعی، در تصاویر واقعی
          </h2>
          <p className="mt-4 text-sm leading-7 text-foreground/60">
            دستگیره وسط تصویر را به طرفین بکشید تا تفاوت قبل و بعد از جراحی را
            ببینید.
          </p>
        </Reveal>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <BeforeAfter
              before={BEFORE_AFTER.bimax.before}
              after={BEFORE_AFTER.bimax.after}
              label={`${BEFORE_AFTER.bimax.label} — دکتر حامد کرمانی`}
            />
          </Reveal>
          <Reveal delay={0.12}>
            <BeforeAfter
              before={BEFORE_AFTER.blepharo.before}
              after={BEFORE_AFTER.blepharo.after}
              label="بلفاروپلاستی — نمونه انجام شده"
            />
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-12 text-center">
          <Link
            href="/gallery"
            className="inline-block rounded-full bg-teal px-8 py-4 text-sm font-bold text-white shadow-lg shadow-teal/25 transition hover:bg-teal-2"
          >
            مشاهده گالری کامل
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= SUCCESS RATES ================= */
function SuccessRates() {
  const { successRates: SUCCESS_RATES, team: TEAM } = useContent();
  return (
    <section className="bg-bone py-24" aria-label="آمار نتایج درمان ها">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="flex items-center gap-3 text-sm font-bold text-teal-2">
            <span className="h-px w-10 bg-teal" aria-hidden />
            آمار نتایج درمان ها
          </p>
          <h2 className="mt-4 text-3xl font-black leading-snug sm:text-4xl">
            اعداد، خودشان حرف می زنند
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {SUCCESS_RATES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <MagicCard
                className="h-full rounded-2xl"
                surface="#ffffff"
                gradientSize={260}
              >
                <div className="relative h-full overflow-hidden rounded-2xl bg-white p-8">
                  <p className="text-5xl font-black text-teal">{s.rate}</p>
                  <h3 className="mt-4 font-extrabold leading-7">{s.title}</h3>
                  <p className="mt-2 text-sm text-foreground/60">{s.detail}</p>
                  <span
                    aria-hidden
                    className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-teal/8 transition-transform duration-500 group-hover:scale-150"
                  />
                </div>
              </MagicCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= TEAM ================= */
function TeamSection() {
  const { team: TEAM, faq: FAQ } = useContent();
  return (
    <section className="bg-white py-24" aria-label="اعضای مجموعه">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="flex items-center gap-3 text-sm font-bold text-teal-2">
            <span className="h-px w-10 bg-teal" aria-hidden />
            اعضای مجموعه
          </p>
          <h2 className="mt-4 text-3xl font-black leading-snug sm:text-4xl">
            تیم درمان و پشتیبانی
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <div className="group overflow-hidden rounded-2xl bg-bone transition-shadow hover:shadow-xl hover:shadow-ink/10">
                <div className="relative aspect-square overflow-hidden bg-ink-3">
                  {m.image ? (
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/25" aria-hidden>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold">{m.name}</h3>
                  <p className="mt-1 text-sm text-foreground/60">{m.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FAQ (AEO) ================= */
function FaqSection() {
  const { site: SITE, faq: FAQ } = useContent();
  return (
    <section className="bg-bone py-24" aria-label="سوالات متداول">
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
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-ink/15 px-7 py-3.5 text-sm font-bold transition hover:border-teal hover:text-teal-2">
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
                className="rounded-2xl border border-ink/10 bg-white px-6 shadow-sm"
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

/* ================= CTA ================= */
function CtaSection() {
  const { site: SITE } = useContent();
  return (
    <section className="relative overflow-hidden bg-teal-3 py-20 text-white" aria-label="تماس با ما">
      <div
        aria-hidden
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "url(/images/clinic-2.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-l from-teal-3 via-teal-3/80 to-teal-3" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-black leading-snug sm:text-4xl">
            مسیر درمان شما از یک مشاوره ساده شروع می شود
          </h2>
          <p className="mx-auto mt-5 max-w-[58ch] text-base leading-8 text-white/80">
            مشاوره تلفنی در تمام ایام هفته پاسخگوی شماست. برای رزرو نوبت یا
            ارسال عکس رادیوگرافی و دریافت نظر اولیه، همین حالا تماس بگیرید.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <PulsatingButton
              href={`tel:${SITE.phone}`}
              ariaLabel={`تماس با مطب — ${SITE.phoneDisplay}`}
              className="bg-white px-9 py-4 text-base font-black text-teal-3 shadow-xl transition hover:bg-bone"
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

/* ================= PAGE ================= */
export function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <AboutTeaser />
      <ServicesSection />
      <BeforeAfterSection />
      <SuccessRates />
      <TeamSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
