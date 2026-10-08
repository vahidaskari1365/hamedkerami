"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/cinematic";
import { PageHero } from "@/components/pages/about";
import { BeforeAfter } from "@/components/before-after";
import { BEFORE_AFTER, GALLERY_CATS, GALLERY_CASES, VIDEOS } from "@/lib/data";

export function GalleryPage() {
  const [cat, setCat] = useState("همه");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const cases = cat === "همه" ? GALLERY_CASES : GALLERY_CASES.filter((c) => c.cat === cat);

  return (
    <>
      <PageHero
        crumb="گالری"
        eyebrow="گالری"
        title="نمونه جراحی ها، قبل و بعد و فضای کلینیک"
        desc="گالری جراحی های فک (ارتوسرجری) و بازسازی فک و کاشت دندان (ایمپلنت) — انجام درمان موفق منوط به تجربیات آکادمیک و میدانی مناسب، پایداری به اصول علمی و فارغ از توجه به زوایای مالی می باشد."
      />

      {/* before-after sliders */}
      <section className="bg-ink py-20 text-white" aria-label="مقایسه قبل و بعد">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="mb-12">
            <h2 className="text-2xl font-black sm:text-3xl">قبل و بعد جراحی</h2>
            <p className="mt-3 text-sm text-white/60">
              دستگیره وسط تصویر را به طرفین بکشید.
            </p>
          </Reveal>
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <BeforeAfter
                before={BEFORE_AFTER.bimax.before}
                after={BEFORE_AFTER.bimax.after}
                label={BEFORE_AFTER.bimax.label}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <BeforeAfter
                before={BEFORE_AFTER.blepharo.before}
                after={BEFORE_AFTER.blepharo.after}
                label={BEFORE_AFTER.blepharo.label}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* filterable grid */}
      <section className="bg-bone py-20" aria-label="نمونه ها">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-2xl font-black sm:text-3xl">گالری نمونه ها</h2>
          </Reveal>
          <div className="thin-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2">
            {GALLERY_CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  cat === c
                    ? "bg-ink text-white shadow-lg"
                    : "bg-white text-foreground/70 ring-1 ring-ink/10 hover:ring-teal/40"
                }`}
                aria-pressed={cat === c}
              >
                {c}
              </button>
            ))}
          </div>

          <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {cases.map((c) => (
                <motion.figure
                  layout
                  key={c.src}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-2xl bg-ink"
                  onClick={() => setLightbox(c.src)}
                >
                  <Image
                    src={c.src}
                    alt={`${c.title} — ${c.cat}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-[1.1s] ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                  <figcaption className="absolute bottom-0 right-0 left-0 p-5 text-white">
                    <p className="text-[11px] font-bold text-teal">{c.cat}</p>
                    <p className="mt-1 text-sm font-extrabold">{c.title}</p>
                  </figcaption>
                </motion.figure>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* videos */}
      <section className="bg-white py-20" aria-label="فیلم های جراحی">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-2xl font-black sm:text-3xl">فیلم های جراحی</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-foreground/60">
              {VIDEOS.note} — از طریق کانال آپارات مجموعه قابل مشاهده است.
            </p>
            <a
              href={VIDEOS.aparat}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-9 py-4 text-sm font-bold text-white transition hover:bg-ink-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5.5v13l11-6.5L8 5.5z" />
              </svg>
              مشاهده کانال آپارات
            </a>
          </Reveal>
        </div>
      </section>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/90 p-6 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label="نمایش تصویر بزرگ"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-2xl"
            >
              <Image src={lightbox} alt="نمایش کامل تصویر گالری" fill sizes="90vw" className="object-contain" />
            </motion.div>
            <button
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 transition hover:bg-white/20"
              onClick={() => setLightbox(null)}
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
