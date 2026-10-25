"use client";

/* ============================================================
   ContactDock — داک شناور «دسترسی سریع» پایین صفحه
   کپسول تیره شیشه‌ای وسط پایین با ۵ میان‌بر تماس:
   مسیریابی گوگل مپ، اینستاگرام، آپارات، واتسپ، تماس تلفنی.
   کلاس floating-actions حفظ شده تا قانون CSS حالت PWA
   (بالای تب‌بار در حالت نصب‌شده) بدون تغییر کار کند.
   در پنل ادمین هرگز رندر نمی‌شود.
   ============================================================ */

import { usePathname } from "next/navigation";
import { useContent } from "@/lib/content-context";
import { waLink } from "@/lib/data";

function PhoneIcon() {
  return (
    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
  );
}

export function ContactDock() {
  const path = usePathname();
  const { site: SITE } = useContent();
  if (path.startsWith("/admin")) return null;

  const items = [
    {
      href: SITE.maps || "https://g.co/kgs/5VU5kZq",
      label: "مسیریابی در گوگل مپ",
      external: true,
      icon: (
        <>
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </>
      ),
    },
    {
      href: SITE.instagram || "https://www.instagram.com/dr.hamedkermani.omfs/",
      label: "اینستاگرام دکتر کرمانی",
      external: true,
      icon: (
        <>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </>
      ),
    },
    {
      href: SITE.aparat || "https://www.aparat.com/dromfs",
      label: "ویدیوهای آموزشی در آپارات",
      external: true,
      icon: <path d="m6 3 14 9-14 9V3z" />,
    },
    {
      href: waLink(SITE.whatsapp),
      label: "گفتگو در واتسپ",
      external: true,
      icon: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
    },
    {
      href: `tel:${SITE.phone}`,
      label: "تماس با مطب",
      external: false,
      icon: <PhoneIcon />,
    },
  ].filter((it) => Boolean(it.href));

  return (
    <div
      role="navigation"
      aria-label="دسترسی سریع تماس"
      className="floating-actions pointer-events-none fixed bottom-4 right-0 left-0 z-[85] flex justify-center px-4 pb-[env(safe-area-inset-bottom)]"
    >
      <nav
        /* GEO: ورود با CSS keyframes به‌جای initial opacity:0 اینلاین */
        className="geo-enter-dock pointer-events-auto flex h-[58px] items-center gap-1 rounded-full bg-ink-3/90 p-2 shadow-[0_18px_50px_-16px_rgba(0,0,0,0.75)] ring-1 ring-white/12 backdrop-blur-xl"
      >
        {/* میان‌برها — راست به چپ: مپ، اینستاگرام، آپارات، واتسپ، تماس */}
        {items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            aria-label={it.label}
            title={it.label}
            {...(it.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-gold-soft/85 transition-all duration-300 hover:bg-white/10 hover:text-gold-soft active:scale-90"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {it.icon}
            </svg>
          </a>
        ))}
      </nav>
    </div>
  );
}
