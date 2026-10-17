"use client";

import Image from "next/image";
import { Link, usePathname } from "@/components/hash-router";
import { useContent } from "@/lib/content-context";
import { NAV } from "@/lib/data";

export function Footer() {
  const { site: SITE, hours: HOURS, brand } = useContent();
  const pathname = usePathname();
  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="spotlight-sweep relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
                <Image src={brand?.logoImage || "/images/logo.png"} alt="لوگوی دکتر حامد کرمانی" fill sizes="56px" className="object-cover" />
              </span>
              <div>
                <p className="text-lg font-extrabold">دکتر حامد کرمانی</p>
                <p className="text-xs text-white/60">متخصص جراحی فک و صورت</p>
                <p className="text-xs text-white/60">فلوشیپ جراحی های کرانیوفیشال</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-white/65">
              جراحی ارتوگناتیک فک، جنیوپلاستی، بلفاروپلاستی، ایمپلنت دندان و بازسازی فک با
              بیش از ۱۶ سال تجربه آکادمیک و بالینی در تهران.
            </p>
            <div className="mt-5 flex gap-3">
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="اینستاگرام دکتر حامد کرمانی"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/15 transition hover:bg-teal hover:ring-teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href={SITE.aparat} target="_blank" rel="noopener noreferrer" aria-label="آپارات دکتر حامد کرمانی"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/15 transition hover:bg-teal hover:ring-teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5L8 5.5z"/></svg>
              </a>
              <a href={SITE.maps} target="_blank" rel="noopener noreferrer" aria-label="لوکیشن گوگل مپ مطب"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/15 transition hover:bg-teal hover:ring-teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <nav aria-label="لینک های فوتر">
            <p className="text-sm font-bold text-teal">دسترسی سریع</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {NAV.map((n) => (
                <li key={n.path}>
                  <Link
                    href={n.path}
                    className={`transition hover:text-white ${pathname === n.path ? "text-teal" : ""}`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Hours */}
          <div>
            <p className="text-sm font-bold text-teal">ساعات کاری</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {HOURS.map((h) => (
                <li key={h.day} className="flex items-center justify-between gap-2 border-b border-white/8 pb-2">
                  <span>
                    {h.day}
                    {h.doctor && <span className="text-white/45"> — {h.doctor}</span>}
                  </span>
                  <span className={h.time === "تعطیل" ? "text-destructive/90" : "text-white/90"}>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-bold text-teal">تماس و رزرو نوبت</p>
            <ul className="mt-4 space-y-4 text-sm text-white/70">
              <li>
                <a href={`tel:${SITE.phone}`} className="flex items-center gap-3 transition hover:text-white" dir="ltr">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z"/></svg>
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition hover:text-white" dir="ltr">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.5 8.5 0 01-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1121 11.5z"/></svg>
                  واتسپ: {SITE.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3 leading-6">
                <svg className="mt-1 shrink-0" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>
                {SITE.address}
              </li>
            </ul>
            <a
              href={`tel:${SITE.phone}`}
              className="mt-6 inline-block rounded-full bg-teal px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal/25 transition hover:bg-teal-2"
            >
              مشاوره تلفنی در تمام ایام هفته
            </a>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-white/50 sm:px-6">
            <p>کپی رایت © ۱۴۰۴ — دکتر حامد کرمانی، متخصص جراحی فک و صورت</p>
            <p dir="ltr" className="tracking-wide">dromfs.com — OMFS Craniofacial Surgery</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
