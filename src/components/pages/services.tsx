"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal } from "@/components/cinematic";
import { PageHero } from "@/components/pages/about";
import { Link } from "@/components/hash-router";
import { useContent } from "@/lib/content-context";

export function ServicesPage() {
  const { services: SERVICES, serviceExtras: SERVICE_EXTRAS } = useContent();
  return (
    <>
      <PageHero
        crumb="خدمات"
        eyebrow="تمام خدمات ما"
        title="کارهایی که انجام می دهیم"
        desc="جراحی های ارتوگناتیک فک، زیبایی و بازسازی، ایمپلنت های پیشرفته و جراحی های داخل دهان — با برنامه ریزی دیجیتال و بر اساس جدیدترین پروتکل های جهانی."
      />

      {/* expandable service cards */}
      <section className="bg-bone py-20" aria-label="لیست خدمات">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={0.05}>
              <article
                id={s.slug}
                /* GEO: ورود با CSS keyframes — بدون استایل opacity:0 اینلاین */
                className={`geo-enter grid overflow-hidden rounded-3xl bg-white shadow-sm lg:grid-cols-2 ${
                  i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
                }`}
              >
                <figure className="relative min-h-[280px] lg:min-h-[380px]">
                  <Image
                    src={s.image}
                    alt={`${s.title} — دکتر حامد کرمانی`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:bg-gradient-to-l" />
                </figure>
                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <p className="text-xs font-bold tracking-wide text-teal" dir="ltr">
                    {s.latin}
                  </p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">{s.title}</h2>
                  <p className="mt-5 max-w-[58ch] text-base leading-8 text-foreground/70">
                    {s.desc}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-sm leading-7">
                        <svg className="mt-1.5 shrink-0 text-teal" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/appointment"
                      className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:bg-ink-3"
                    >
                      مشاوره و رزرو نوبت
                    </Link>
                    <Link
                      href="/costs"
                      className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold transition hover:border-teal hover:text-teal-2"
                    >
                      هزینه ها
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* extras */}
      <section className="bg-ink py-20 text-white" aria-label="خدمات تخصصی دیگر">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="max-w-2xl">
            <h2 className="text-2xl font-black sm:text-3xl">حوزه های تخصصی دیگر</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              علاوه بر جراحی های اصلی، مجموعه ما خدمات تخصصی زیر را نیز ارائه می دهد.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_EXTRAS.map((x, i) => (
              <Reveal key={x.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-white/10 bg-ink-2 p-6 transition-colors hover:border-teal/50">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal/15 text-teal" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 014 4v1a4 4 0 013 3.87V13a7 7 0 01-14 0v-2.13A4 4 0 018 7V6a4 4 0 014-4z" />
                      <path d="M8 21h8" />
                    </svg>
                  </span>
                  <h3 className="mt-5 font-extrabold">{x.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/60">{x.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1} className="mt-12 text-center">
            <Link
              href="/gallery"
              className="inline-block rounded-full bg-teal px-8 py-4 text-sm font-bold shadow-lg shadow-teal/25 transition hover:bg-teal-2"
            >
              مشاهده نمونه جراحی ها در گالری
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
