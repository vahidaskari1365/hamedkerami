import type { Metadata } from "next";
import { EnChrome } from "@/components/en/en-chrome";
import { EN_BRAND } from "@/lib/en-content";

/* ============================================================
   /en layout — چارچوب انگلیسی (LTR) روی ریشه فارسی سوار می‌شود
   metadataBase و GA4 از layout ریشه ارث می‌رسد؛ اینجا فقط
   متادیتای انگلیسی و شل انگلیسی.
   ============================================================ */

export const metadata: Metadata = {
  title: {
    default: "Dr. Hamed Kermani | Oral & Maxillofacial Surgeon in Tehran, Iran",
    template: "%s | Dr. Hamed Kermani",
  },
  description: EN_BRAND.description,
  openGraph: {
    locale: "en_US",
    siteName: "Dr. Hamed Kermani — Oral & Maxillofacial Surgery",
  },
};

export default function EnLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <EnChrome>{children}</EnChrome>;
}
