"use client";

import Image from "next/image";
import { Link, usePathname } from "@/components/hash-router";
import { useContent } from "@/lib/content-context";
import { NAV } from "@/lib/data";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
// Link comes from hash-router (preview-safe client routing)

export function Navbar() {
  const { site: SITE } = useContent();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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
      className={`fixed top-0 right-0 left-0 z-[80] transition-all duration-500 ${
        scrolled
          ? "bg-ink/85 backdrop-blur-xl shadow-lg shadow-black/20 py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="صفحه اصلی دکتر حامد کرمانی">
          <span className="relative h-11 w-11 overflow-hidden rounded-full shadow-md ring-1 ring-white/25">
            <Image src="/images/logo.png" alt="لوگوی دکتر حامد کرمانی" fill sizes="44px" className="object-cover" />
          </span>
          <span className={`leading-tight transition-colors duration-500 ${scrolled ? "text-white" : "text-white"}`}>
            <span className="block text-sm font-extrabold sm:text-base">دکتر حامد کرمانی</span>
            <span className="block text-[11px] text-white/70">متخصص جراحی فک و صورت</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="منوی اصلی">
          {NAV.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? "text-teal" : "text-white/85 hover:text-white"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/10 ring-1 ring-teal/40"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
          <a
            href={`tel:${SITE.phone}`}
            className="mr-2 rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal/30 transition hover:bg-teal-2 hover:shadow-teal/50"
          >
            رزرو نوبت
          </a>
        </nav>

        {/* Mobile burger */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-ink/95 backdrop-blur-xl lg:hidden"
            aria-label="منوی موبایل"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    pathname === item.path
                      ? "bg-teal/15 text-teal"
                      : "text-white/85 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`tel:${SITE.phone}`}
                className="mt-2 rounded-xl bg-teal px-4 py-3 text-center text-sm font-bold text-white"
              >
                رزرو نوبت: {SITE.phoneDisplay}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
