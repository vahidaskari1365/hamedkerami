"use client";

/* ============================================================
   EnChrome — چارچوب صفحات انگلیسی /en
   نوار شیشه‌ای لاتین (LTR)، فوتر انگلیسی، دکمه شناور واتسپ،
   ثبت آمار بازدید و تنظیم زبان تگ <html>.
   جدا از SiteShell فارسی تا RTL/فونت/ناوبری فارسی دخالتی
   نکند؛ همان زبان بصری (لاک + طلایی) حفظ شده است.
   ============================================================ */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HtmlLang } from "@/components/html-lang";
import { EN_BRAND, EN_CLINIC, EN_NAV } from "@/lib/en-content";

const SITE_PHONE = "+982166921500";

/* ---------- آمار بازدید — همان endpoint فارسی ---------- */
function EnTracker() {
  const path = usePathname();
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer: document.referrer || "" }),
      keepalive: true,
    }).catch(() => {});
  }, [path]);
  return null;
}

export function EnChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  return (
    <div lang="en" dir="ltr" className="en-root flex min-h-screen flex-col">
      <HtmlLang lang="en" dir="ltr" />
      <EnTracker />

      {/* ---------- نوار بالا ---------- */}
      <header className="fixed top-3 right-0 left-0 z-[80] flex justify-center px-4">
        <div className="w-full max-w-5xl">
          <motion.nav
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-1 rounded-full bg-ink/60 py-2 pl-2 pr-4 shadow-lg shadow-black/25 ring-1 ring-white/10 backdrop-blur-xl"
            aria-label="Main navigation"
          >
            <Link
              href="/en"
              className="group flex shrink-0 items-center gap-2.5 rounded-full py-1 pr-1"
              aria-label="Dr. Hamed Kermani — home"
            >
              <span className="relative h-9 w-9 overflow-hidden rounded-full shadow-md ring-1 ring-white/25 transition-transform duration-500 group-hover:scale-105">
                <Image src="/images/logo.png" alt="Dr. Hamed Kermani logo" fill sizes="36px" className="object-cover" />
              </span>
              <span className="hidden min-[420px]:flex flex-col leading-none">
                <span className="whitespace-nowrap text-[13px] font-extrabold text-white">
                  Dr. Hamed Kermani
                </span>
                <span className="mt-1 whitespace-nowrap text-[10px] text-white/60">
                  Oral &amp; Maxillofacial Surgeon
                </span>
              </span>
            </Link>

            <ul className="ml-auto hidden items-center gap-0.5 lg:flex">
              {EN_NAV.map((item) => {
                const active = pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      aria-current={active ? "page" : undefined}
                      className={`relative block whitespace-nowrap rounded-full px-2.5 py-2 text-[12.5px] font-medium transition-colors duration-300 xl:px-3 xl:text-[13px] ${
                        active ? "text-white" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="en-nav-pill"
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

            <div className="ml-auto flex items-center gap-2 lg:ml-2">
              <Link
                href="/"
                hrefLang="fa"
                className="hidden items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-bold text-white/80 transition hover:bg-white/10 hover:text-white sm:flex"
                aria-label="Persian version (فارسی)"
              >
                فارسی
              </Link>
              <Link
                href="/en/contact"
                className="hidden items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-[13px] font-black text-ink shadow-lg shadow-teal/25 transition-all duration-300 hover:scale-[1.04] hover:bg-gold-soft active:scale-95 sm:flex"
              >
                Book a Visit
              </Link>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal lg:hidden"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </motion.nav>

          {/* منوی موبایل */}
          <AnimatePresence>
            {open && (
              <motion.nav
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-2 overflow-hidden rounded-3xl bg-ink/95 p-2 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-xl lg:hidden"
                aria-label="Mobile menu"
              >
                {EN_NAV.map((item) => {
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
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <Link
                    href="/"
                    hrefLang="fa"
                    className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm font-bold text-white/85"
                  >
                    فارسی
                  </Link>
                  <Link
                    href="/en/contact"
                    className="flex items-center justify-center rounded-2xl bg-teal px-4 py-3.5 text-sm font-black text-ink"
                  >
                    Book a Visit
                  </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ---------- محتوا ---------- */}
      <main className="flex-1">{children}</main>

      {/* ---------- دکمه شناور واتسپ ---------- */}
      <a
        href={EN_CLINIC.whatsappText}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 left-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-teal text-ink shadow-xl shadow-black/30 ring-1 ring-white/20 transition hover:scale-105 active:scale-95"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2.1 21.9l4.8-1.5A9.9 9.9 0 1 0 12.04 2Zm5.7 13.9c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.24-3.8-.79-3.2-1.26-5.22-4.55-5.38-4.76-.16-.21-1.28-1.7-1.28-3.24 0-1.54.8-2.3 1.09-2.61.29-.3.63-.38.84-.38h.6c.2 0 .46-.07.71.54.26.63.88 2.17.96 2.33.08.16.13.34.02.55-.1.21-.16.34-.31.52l-.47.55c-.16.16-.32.33-.14.65.18.31.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.49 1.54.31.16.5.13.68-.08.18-.21.78-.9.99-1.21.21-.31.42-.26.7-.16.29.1 1.82.86 2.13 1.02.31.16.52.23.6.37.07.13.07.78-.17 1.47Z" />
        </svg>
      </a>

      {/* ---------- فوتر ---------- */}
      <footer className="border-t border-white/8 bg-ink pb-24 pt-12 text-white sm:pb-12">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="text-base font-black text-gold-soft">{EN_BRAND.name}</p>
            <p className="mt-1 text-xs text-white/55">{EN_BRAND.roleLong}</p>
            <p className="mt-4 max-w-sm text-[13px] leading-6 text-white/65">
              Board-certified oral &amp; maxillofacial surgeon in Tehran — craniofacial
              fellowship, 1,067+ jaw surgeries and 5,000+ dental implants. International
              patients are welcome: online consultation before you fly.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://www.instagram.com/dr.hamedkermani.omfs/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Instagram
              </a>
              <a
                href="https://www.aparat.com/dromfs"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Surgery Videos
              </a>
              <Link
                href="/"
                hrefLang="fa"
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                فارسی
              </Link>
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <p className="text-sm font-black text-white">Pages</p>
            <ul className="mt-3 space-y-2 text-[13px] text-white/60">
              {EN_NAV.map((n) => (
                <li key={n.path}>
                  <Link href={n.path} className="transition hover:text-gold-soft">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-sm font-black text-white">Clinic</p>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-6 text-white/60">
              <li>{EN_CLINIC.addressEn}</li>
              <li className="ltr-num">
                <a href={`tel:${SITE_PHONE}`} className="font-bold text-gold-soft hover:underline">
                  {EN_CLINIC.phoneDisplay}
                </a>
              </li>
              <li className="ltr-num">
                <a href={EN_CLINIC.whatsappText} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp (international)
                </a>
              </li>
              <li>Saturday – Wednesday · 3:00–7:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-white/8 px-4 pt-6 text-[11px] text-white/40 sm:px-6">
          <p>© {new Date().getFullYear()} {EN_BRAND.name} — All rights reserved.</p>
          <p>
            Information on this site is educational and does not replace an in-person medical
            consultation. · <Link href="/privacy" className="hover:text-white/70">Privacy (فارسی)</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
