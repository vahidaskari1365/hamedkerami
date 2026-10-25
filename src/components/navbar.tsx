"use client";

import Image from "next/image";
import { Link, usePathname } from "@/components/hash-router";
import { useContent } from "@/lib/content-context";
import { NAV } from "@/lib/data";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ============================================================
   Navbar — پیل شیشه‌ای شناور بالای صفحه (سبک سایت‌های مدرن)
   همیشه شیشه‌ای (backdrop-blur) با فاصله از لبه‌ها، لوگو و CTA
   داخل خود پیل، آیتم فعال با قرص متحرک (layoutId) و منوی
   موبایل به‌صورت کارت شیشه‌ای شناور زیر پیل.
   ناوبری سیال: مخفی با اسکرول پایین، ظاهر با اسکرول بالا.
   ============================================================ */

export function Navbar() {
  const { brand } = useContent();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 40);
        if (Math.abs(y - lastY) > 6) {
          setHidden(y > lastY && y > 320);
          lastY = y;
        }
        ticking = false;
      });
    };
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // close mobile menu on route change (adjusting state during render)
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  return (
    <header
      className={`fixed top-3 right-0 left-0 z-[80] flex justify-center px-4 transition-transform duration-500 ease-out ${
        hidden && !open ? "-translate-y-[130%]" : "translate-y-0"
      }`}
    >
      <div className="w-full max-w-5xl">
        <nav
          /* GEO: ورود با CSS keyframes به‌جای initial opacity:0 اینلاین */
          className={`geo-enter-nav flex items-center gap-1 rounded-full py-2 pr-2 pl-4 ring-1 backdrop-blur-xl transition-[background-color,box-shadow] duration-500 ${
            scrolled
              ? "bg-ink/90 shadow-xl shadow-black/40 ring-white/10"
              : "bg-ink/60 shadow-lg shadow-black/25 ring-white/10"
          }`}
          aria-label="ناوبری اصلی"
        >
          {/* لوگو + نام — داخل پیل */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-full py-1 pl-1"
            aria-label="صفحه اصلی دکتر حامد کرمانی"
          >
            <span className="relative h-9 w-9 overflow-hidden rounded-full shadow-md ring-1 ring-white/25 transition-transform duration-500 group-hover:scale-105">
              <Image
                src={brand?.logoImage || "/images/logo.png"}
                alt="لوگوی دکتر حامد کرمانی"
                fill
                sizes="36px"
                className="object-cover"
              />
            </span>
            <span className="hidden min-[420px]:flex flex-col leading-none">
              <span className="whitespace-nowrap text-[13px] font-extrabold text-white">
                دکتر حامد کرمانی
              </span>
              <span className="mt-1 whitespace-nowrap text-[10px] text-white/60">
                متخصص جراحی فک و صورت
              </span>
            </span>
          </Link>

          {/* منوی دسکتاپ */}
          <ul className="mr-auto hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    aria-current={active ? "page" : undefined}
                    className={`relative block whitespace-nowrap rounded-full px-2.5 py-2 text-[12.5px] font-medium transition-colors duration-300 xl:px-3.5 xl:text-[13px] ${
                      active ? "text-white" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white/12 ring-1 ring-teal/35"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* CTA نوبت‌دهی + سوییچر زبان انگلیسی + برگر موبایل */}
          <div className="mr-auto flex items-center gap-2 lg:mr-2">
            <Link
              href="/en"
              hrefLang="en"
              className="hidden h-9 items-center rounded-full border border-white/15 bg-white/5 px-3 text-[11px] font-black tracking-wide text-white/80 transition hover:bg-white/10 hover:text-white md:flex"
              aria-label="English version"
              title="English version"
            >
              EN
            </Link>
            <Link
              href="/appointment"
              className="hidden items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-[13px] font-black text-ink shadow-lg shadow-teal/25 transition-all duration-300 hover:scale-[1.04] hover:bg-gold-soft active:scale-95 sm:flex"
              aria-label="رزرو نوبت آنلاین"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" /><path d="M9 16l2 2 4-4" />
              </svg>
              رزرو نوبت
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "بستن منو" : "باز کردن منو"}
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal lg:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </nav>

        {/* منوی موبایل — کارت شیشه‌ای شناور زیر پیل */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 overflow-hidden rounded-3xl bg-ink/95 p-2 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-xl lg:hidden"
              aria-label="منوی موبایل"
            >
              {NAV.map((item) => {
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active ? "bg-white/10 text-gold-soft" : "text-white/85 hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />}
                  </Link>
                );
              })}
              <Link
                href="/en"
                hrefLang="en"
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/5"
              >
                English
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-black">EN</span>
              </Link>
              <Link
                href="/appointment"
                className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-teal px-4 py-3.5 text-sm font-black text-ink"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" /><path d="M9 16l2 2 4-4" />
                </svg>
                رزرو نوبت آنلاین
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
