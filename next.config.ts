import type { NextConfig } from "next";

/* ============================================================
   هدرهای امنیتی — همه‌ی مسیرها (صفحات، API، فایل‌های آپلود)
   ============================================================ */
const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      /* gtag.js گوگل آنالیتیکس — مستندات رسمی GA4:
         script: *.googletagmanager | connect: *.google-analytics + *.analytics.google */
      "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
      "media-src 'self'",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  /* ریدایرکت ۳۰۱ مقاله‌های قدیمی حذف‌شده → نزدیک‌ترین صفحه موضوعی.
     این اسلاگ‌ها در دیپلوی‌های اول روی سایت بودند و ممکن است گوگل
     ایندکس‌شان کرده باشد؛ ۴۰۴ دادن سیگنال منفی سئو است. */
  async redirects() {
    return [
      { source: "/blog/orthognathic-surgery", destination: "/jaw-surgery", permanent: true },
      { source: "/blog/jaw-surgery-guide", destination: "/jaw-surgery", permanent: true },
      { source: "/blog/bimax-surgery", destination: "/jaw-surgery", permanent: true },
      { source: "/blog/monomax-surgery", destination: "/jaw-surgery", permanent: true },
      { source: "/blog/jaw-dislocation", destination: "/blog/jaw-asymmetry", permanent: true },
      { source: "/blog/tmj-prosthesis", destination: "/blog/jaw-surgery-complications", permanent: true },
      { source: "/blog/jaw-surgery-cost", destination: "/costs", permanent: true },
      { source: "/blog/genioplasty", destination: "/chin-surgery", permanent: true },
      { source: "/blog/chin-surgery", destination: "/chin-surgery", permanent: true },
      { source: "/blog/dental-implant", destination: "/dental-implant", permanent: true },
      { source: "/blog/zygomatic-implant", destination: "/dental-implant", permanent: true },
      { source: "/blog/root-nerve-meaning", destination: "/dental-implant", permanent: true },
      { source: "/blog/wisdom-root-nerve", destination: "/dental-implant", permanent: true },
      { source: "/blog/wisdom-teeth-recovery", destination: "/dental-implant", permanent: true },
      { source: "/blog/facial-cosmetic-surgery", destination: "/services", permanent: true },
      { source: "/blog/google-scholar", destination: "/about", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
