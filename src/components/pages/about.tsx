"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Counter, Parallax, Reveal } from "@/components/cinematic";
import { Link } from "@/components/hash-router";
import { BIO, CERTIFICATES, EDUCATION, STATS, SUCCESS_RATES, SITE, TEAM } from "@/lib/data";

export function PageHero({
  eyebrow,
  title,
  desc,
  crumb,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  crumb: string;
}) {
  return (
    <section className="spotlight-sweep relative overflow-hidden bg-ink pb-16 pt-36 text-white sm:pb-20 sm:pt-44">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="مسیر صفحه" className="mb-6 text-xs text-white/50">
          <Link href="/" className="transition hover:text-teal">خانه</Link>
          <span aria-hidden className="mx-2">/</span>
          <span className="text-teal">{crumb}</span>
        </nav>
        <motion.p
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-4 flex items-center gap-3 text-sm font-semibold text-teal"
        >
          <span className="h-px w-10 bg-teal" aria-hidden />
          {eyebrow}
        </motion.p>
        <h1 className="max-w-3xl text-4xl font-black leading-[1.2] sm:text-5xl">
          {title}
        </h1>
        {desc && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-5 max-w-[64ch] text-base leading-8 text-white/70"
          >
            {desc}
          </motion.p>
        )}
      </div>
    </section>
  );
}

export function AboutPage() {
  const [cert, setCert] = useState<{ src: string; title: string } | null>(null);

  return (
    <>
      <PageHero
        crumb="درباره دکتر"
        eyebrow="رزومه و سوابق"
        title="دکتر حامد کرمانی، متخصص جراحی فک و صورت و فلوشیپ کرانیوفاسیال"
        desc="از دندانپزشکی عمومی در دانشگاه مشهد تا فلوشیپ جراحی های کرانیوفاسیال دانشگاه تهران و استادی دانشگاه های علوم پزشکی شهید بهشتی و مشهد."
      />

      {/* bio + photo */}
      <section className="bg-bone py-20" aria-label="زندگی نامه">
        <div className="mx-auto grid max-w-7xl items-start gap-14 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="relative">
            <div className="vignette relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-ink/15">
              <Parallax speed={0.06} className="h-full w-full">
                <Image
                  src="/images/dr-kermani-xl.png"
                  alt="دکتر حامد کرمانی متخصص جراحی فک و صورت"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top"
                />
              </Parallax>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {SUCCESS_RATES.slice(0, 2).map((s) => (
                <div key={s.title} className="rounded-2xl bg-white p-5 text-center shadow-sm">
                  <p className="text-3xl font-black text-teal">{s.rate}</p>
                  <p className="mt-1 text-xs leading-5 text-foreground/60">{s.title}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div>
            <Reveal>
              <h2 className="text-2xl font-black sm:text-3xl">درباره من</h2>
              <p className="mt-6 text-base leading-9 text-foreground/75">{BIO.intro}</p>
              <p className="mt-5 text-base leading-9 text-foreground/75">{BIO.academic}</p>
              <p className="mt-5 text-base leading-9 text-foreground/75">
                در طول دوره کار و تحصیل، علاوه بر تحصیلات آکادمیک مصوب وزارت بهداشت، در دوره های متعدد داخلی و خارجی و بین المللی شرکت کرده و با تجربیات جراحی فک و صورت در کشورهای مختلف از جمله بلژیک، آلمان و چین آشنا شدم. همچنین {BIO.school} هستم.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="rounded-full bg-teal/10 px-5 py-2.5 text-sm font-bold text-teal-3">
                  {BIO.scholar}
                </span>
                <span className="rounded-full bg-ink/5 px-5 py-2.5 text-sm font-bold text-foreground/70">
                  مدرک فلوشیپ کرانیوفاسیال — دانشگاه تهران
                </span>
              </div>
            </Reveal>

            {/* education timeline */}
            <Reveal delay={0.1} className="mt-14">
              <h3 className="text-xl font-black">مدارک و سوابق تحصیلی</h3>
              <ol className="relative mt-8 space-y-8 border-r-2 border-teal/25 pr-6">
                {EDUCATION.map((e, i) => (
                  <motion.li
                    key={e.title + e.year}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: i * 0.08 }}
                    className="relative"
                  >
                    <span className="absolute -right-[31px] top-1.5 h-4 w-4 rounded-full border-[3px] border-teal bg-bone" aria-hidden />
                    <p className="text-xs font-bold text-teal-2">{e.year}</p>
                    <p className="mt-1 font-extrabold">{e.title}</p>
                    <p className="mt-0.5 text-sm text-foreground/60">{e.place}</p>
                  </motion.li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* certificates — منتقل شده از بخش مدارک و گواهینامه های سایت قبلی */}
      <section className="bg-bone py-20" aria-label="مدارک و گواهینامه ها">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="max-w-2xl">
            <p className="mb-4 flex items-center gap-3 text-sm font-semibold text-teal-3">
              <span className="h-px w-10 bg-teal-3" aria-hidden />
              مدارک و گواهینامه ها
            </p>
            <h2 className="text-2xl font-black sm:text-3xl">
              گواهینامه های داخلی و بین المللی دکتر کرمانی
            </h2>
            <p className="mt-4 text-sm leading-7 text-foreground/60">
              مجموعه ای از مدارک، گواهینامه های دوره های تخصصی داخلی و بین المللی و مدرک بورد
              جراحی فک و صورت — شامل دوره های AOCMF، انکولوژی و بازسازی فک و صورت، جراحی
              اندوسکوپیک سینوس و جراحی های زیبایی.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CERTIFICATES.map((c, i) => (
              <Reveal key={c.src} delay={(i % 3) * 0.08}>
                <figure
                  className="group cursor-zoom-in overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5 transition hover:shadow-xl hover:shadow-ink/10"
                  onClick={() => setCert(c)}
                  role="button"
                  tabIndex={0}
                  aria-label={`مشاهده بزرگ: ${c.title}`}
                  onKeyDown={(e) => e.key === "Enter" && setCert(c)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-bone">
                    <Image
                      src={c.src}
                      alt={`${c.title} — گواهینامه دکتر حامد کرمانی`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="p-4 text-xs font-bold leading-6 text-foreground/75">
                    {c.title}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* stats band */}
      <section className="bg-ink py-16 text-white" aria-label="آمار جراحی ها">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <p className="text-4xl font-black text-teal sm:text-5xl">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm text-white/65">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* team */}
      <section className="bg-white py-20" aria-label="تیم پزشکی">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="max-w-2xl">
            <h2 className="text-2xl font-black sm:text-3xl">تیم پزشکی — کادر درمان ما</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.08}>
                <div className="overflow-hidden rounded-2xl bg-bone">
                  <div className="relative aspect-square bg-ink-3">
                    {m.image ? (
                      <Image src={m.image} alt={m.name} fill sizes="25vw" className="object-cover object-top" />
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

          <Reveal delay={0.1} className="mt-12 rounded-3xl bg-teal-3 p-8 text-white sm:p-10">
            <p className="text-lg font-bold leading-8">مشاوره تلفنی در تمام ایام هفته</p>
            <p className="mt-2 text-sm text-white/75">
              برای تعیین وقت مشاوره با مطب تماس بگیرید: {SITE.phoneDisplay}
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-black text-teal-3 transition hover:bg-bone"
            >
              راه های تماس با ما
            </Link>
          </Reveal>
        </div>
      </section>

      {/* certificate lightbox */}
      <AnimatePresence>
        {cert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/92 p-6 backdrop-blur-sm"
            onClick={() => setCert(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`گواهینامه: ${cert.title}`}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-4xl"
            >
              <div className="relative max-h-[78vh] w-full overflow-hidden rounded-2xl bg-white">
                <Image
                  src={cert.src}
                  alt={cert.title}
                  width={1100}
                  height={1500}
                  className="mx-auto max-h-[78vh] w-auto object-contain"
                  priority
                />
              </div>
              <p className="mt-4 text-center text-sm font-bold text-white/85">{cert.title}</p>
            </motion.div>
            <button
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 transition hover:bg-white/20"
              onClick={() => setCert(null)}
              aria-label="بستن"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
