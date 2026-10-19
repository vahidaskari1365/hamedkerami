"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, TiltCard, CinematicImage, FilmGrain } from "@/components/cinematic";
import { PageHero } from "@/components/pages/about";
import { AnimatedShinyText, BorderBeam } from "@/components/magicui";
import { useContent } from "@/lib/content-context";
import { waLink, faToEnDigits } from "@/lib/data";

/* ============================================================
   صفحه هزینه ها — Pricing Suite (بازطراحی UI/UX)
   به جای نمودار داشبوردی: کارت های لوکس مجله ای با تایپوگرافی
   عددی درشت، نوار آماری «شروع هزینه»، پوشش BorderBeam طلایی
   برای پرتقاضاترین ها و جدول sr-only برای سئو/اسکرین‌ریدر.
   ============================================================ */

type Parsed = { min: number; max: number } | null;

/* ---------- تجزیه عدد از قیمت فارسی ---------- */
function parsePriceRange(price: string): Parsed {
  const nums = (faToEnDigits(price).match(/\d+(?:\.\d+)?/g) ?? [])
    .map(Number)
    .filter((n) => n > 0 && n < 100000);
  if (!nums.length) return null;
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

/* ---------- تفکیک نمایشی قیمت: مبلغ بزرگ + برچسب واحد ---------- */
type PriceView = { prefix?: string; amount: string; unit: string; contact: boolean; note?: string };

function splitPrice(price: string): PriceView {
  const p = price.replace(/\u200c/g, " ").trim();
  if (/تماس|وابسته/i.test(p)) {
    return { amount: "", unit: "", contact: true, note: p };
  }
  let rest = p.replace(/میلیون\s*تومان|تومان/g, "").trim();
  let unit = "میلیون تومان";
  if (/هر\s*واحد/.test(rest)) {
    unit = "میلیون تومان / هر واحد";
    rest = rest.replace(/هر\s*واحد/g, "").trim();
  }
  let prefix: string | undefined;
  const pm = rest.match(/^(بین|از)\s+/);
  if (pm) {
    prefix = pm[1];
    rest = rest.slice(pm[0].length).trim();
  }
  rest = rest.replace(/^[-–—]\s*|[-–—]\s*$/g, "").trim();
  return { prefix, amount: rest || p, unit, contact: false };
}

/* ردیف های پرتقاضاترین + نام کوتاه برای نوار آماری */
const HIGHLIGHTS: Record<string, string[]> = {
  jaw: ["جراحی دو فک (جراحی بایمکس)", "جراحی چانه (جنیوپلاستی)"],
  implant: ["ایمپلنت DXL آلمان", "جراحی دندان عقل"],
};
const SHORT_NAME: Record<string, string> = {
  "جراحی دو فک (جراحی بایمکس)": "بایمکس دو فک",
  "جراحی چانه (جنیوپلاستی)": "جنیوپلاستی چانه",
  "ایمپلنت DXL آلمان": "ایمپلنت DXL آلمان",
  "جراحی دندان عقل": "جراحی دندان عقل",
};

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const toFa = (n: number) =>
  String(n)
    .split("")
    .map((d) => FA_DIGITS[Number(d)] ?? d)
    .join("");

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- ورود پلکانی کارت ها ---------- */
const cardVariants = {
  hidden: { opacity: 0, y: 26, filter: "blur(5px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, delay: (i % 6) * 0.07, ease: EASE },
  }),
};

/* ============================================================
   کارت قیمت — تایپوگرافی عدد درشت، هاور لطیف، پوشش طلایی
   ============================================================ */
function PriceCard({
  item,
  price,
  index,
  highlight,
}: {
  item: string;
  price: string;
  index: number;
  highlight: boolean;
}) {
  const v = splitPrice(price);
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-card p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-teal/12 ${
        highlight ? "ring-[1.5px] ring-teal/45" : "ring-1 ring-ink/8 hover:ring-teal/30"
      }`}
    >
      {/* پوشش چرخان طلایی — فقط پرتقاضاترین */}
      {highlight && <BorderBeam width={1.6} speed={9} />}
      {/* هاله ملایم پشت کارت پرتقاضاترین */}
      {highlight && (
        <span aria-hidden className="pointer-events-none absolute -top-16 right-1/2 h-32 w-32 translate-x-1/2 rounded-full bg-teal/12 blur-2xl" />
      )}

      {/* خط طلایی بالای کارت در هاور */}
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-[2px] origin-right scale-x-0 rounded-full bg-gradient-to-l from-transparent via-teal to-transparent transition-transform duration-500 group-hover:scale-x-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          aria-hidden
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-black tabular-nums transition-colors ${
            highlight
              ? "bg-teal text-ink shadow-sm shadow-teal/40"
              : "bg-ink/6 text-foreground/45 group-hover:bg-teal/15 group-hover:text-teal-3"
          }`}
        >
          {toFa(index + 1).padStart(2, "۰")}
        </span>
        {highlight && (
          <span className="rounded-full bg-teal px-2.5 py-1 text-[10px] font-black text-ink shadow-sm shadow-teal/40">
            <AnimatedShinyText className="text-[10px] font-black text-ink">پرتقاضاترین ✦</AnimatedShinyText>
          </span>
        )}
      </div>

      <h3 className="relative mt-4 text-[15px] font-bold leading-7">{item}</h3>

      {/* ناحیه قیمت — قهرمان کارت */}
      {v.contact ? (
        <div className="relative mt-auto pt-6">
          <span
            aria-hidden
            className="mb-3 block h-px bg-[repeating-linear-gradient(to_left,rgba(13,14,11,0.22)_0_6px,transparent_6px_12px)]"
          />
          <p className="flex items-center gap-2 text-[13px] font-bold text-foreground/55">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-teal-2" aria-hidden>
              <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z" />
            </svg>
            {v.note}
          </p>
        </div>
      ) : (
        <div className="relative mt-auto pt-6">
          <span aria-hidden className="mb-4 block h-px bg-gradient-to-l from-transparent via-ink/15 to-transparent" />
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5" dir="rtl">
            {v.prefix && <span className="text-xs font-bold text-foreground/50">{v.prefix}</span>}
            <span className="text-[26px] font-black leading-none tracking-tight tabular-nums text-ink transition-colors duration-300 group-hover:text-teal-3">
              {v.amount}
            </span>
            <span className="text-[11px] font-bold text-teal-3">{v.unit}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* ============================================================
   نوار آماری — شروع هزینه / پرتقاضاترین / مشاوره رایگان
   ============================================================ */
function StatBand({
  rows,
  category,
  phone,
  phoneDisplay,
}: {
  rows: { item: string; price: string }[];
  category: "jaw" | "implant";
  phone: string;
  phoneDisplay: string;
}) {
  const highlights = HIGHLIGHTS[category] ?? [];
  const parsed = rows.map((r) => ({ ...r, parsed: parsePriceRange(r.price) }));
  const min = Math.min(...parsed.filter((r) => r.parsed).map((r) => r.parsed!.min));
  const hl = parsed.find((r) => highlights.includes(r.item) && r.parsed);
  const cells: { label: string; big: string; sub?: string; href?: string }[] = [
    { label: "شروع هزینه از", big: toFa(min), sub: "میلیون تومان" },
    hl && {
      label: SHORT_NAME[hl.item] ?? hl.item,
      big: hl.parsed!.min === hl.parsed!.max ? toFa(hl.parsed!.min) : `${toFa(hl.parsed!.min)} تا ${toFa(hl.parsed!.max)}`,
      sub: "میلیون تومان",
    },
    { label: "مشاوره تلفنی اولیه", big: "رایگان", href: `tel:${phone}` },
  ].filter(Boolean) as { label: string; big: string; sub?: string; href?: string }[];

  return (
    <div className="mb-8 grid grid-cols-1 overflow-hidden rounded-3xl bg-card shadow-lg shadow-ink/4 ring-1 ring-ink/8 sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-ink/6">
      {cells.map((c, i) => {
        const inner = (
          <>
            <p className="text-[11px] font-bold leading-5 text-foreground/50">{c.label}</p>
            <p className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black leading-none tabular-nums text-ink">{c.big}</span>
              {c.sub && <span className="text-[11px] font-bold text-teal-3">{c.sub}</span>}
            </p>
          </>
        );
        return i === 2 && c.href ? (
          <a
            key={c.label}
            href={c.href}
            className="group relative flex flex-col justify-center bg-ink px-6 py-5 text-white transition-colors hover:bg-ink-3"
          >
            {inner}
            <span aria-hidden className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-b from-gold-soft via-teal to-teal-3" />
          </a>
        ) : (
          <div key={c.label} className="relative px-6 py-5">
            {i === 1 && <span aria-hidden className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-b from-teal/60 to-transparent" />}
            {inner}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   جدول sr-only — داده واقعی جدولی برای سئو و اسکرین‌ریدر
   (استایل inline تا بدون وابستگی به JIT تیلویند، هرگز سرریز
    افقی نسازد — سرریز این جدول layout viewport موبایل را
    منبسط می کرد و عناصر fixed را جابه جا می شد)
   ============================================================ */
function SrOnlyTable({
  rows,
  caption,
}: {
  rows: { item: string; price: string }[];
  caption: string;
}) {
  const clip: React.CSSProperties = {
    /* display:block الزامی است — جدول با display:table عرض ۱px را
       نادیده می گیرد و تا جا شدن محتوا باز می شود (سرریز افقی!) */
    display: "block",
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  };
  return (
    <table style={clip}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">نوع خدمت</th>
          <th scope="col">هزینه تقریبی (تومان)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.item}>
            <th scope="row">{r.item}</th>
            <td>{r.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CostCards({
  rows,
  caption,
  category,
  phone,
  phoneDisplay,
  className = "",
}: {
  rows: { item: string; price: string }[];
  caption: string;
  category: "jaw" | "implant";
  phone: string;
  phoneDisplay: string;
  className?: string;
}) {
  const highlights = HIGHLIGHTS[category] ?? [];
  return (
    <div className={className}>
      <StatBand rows={rows} category={category} phone={phone} phoneDisplay={phoneDisplay} />
      <div className={`grid gap-4 ${category === "implant" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {rows.map((r, i) => (
          <PriceCard key={r.item} item={r.item} price={r.price} index={i} highlight={highlights.includes(r.item)} />
        ))}
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-6 text-foreground/50">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-teal-2" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        {caption} — هزینه دقیق پس از معاینه و بررسی رادیوگرافی اعلام می شود
      </p>
      <SrOnlyTable rows={rows} caption={caption} />
    </div>
  );
}

export function CostsPage() {
  const { site: SITE, jawCosts: JAW_COSTS, implantCosts: IMPLANT_COSTS } = useContent();
  return (
    <>
      <PageHero
        crumb="هزینه ها"
        eyebrow="شفافیت در هزینه"
        title="هزینه جراحی های فک و صورت و ایمپلنت"
        desc="هزینه های ذیل تقریبی است و بسته به شرایط هر بیمار، نوع برند انتخابی و حجم جراحی می تواند متفاوت باشد. هزینه دقیق پس از معاینه و بررسی تصاویر رادیوگرافی اعلام می شود."
      />

      <section className="bg-bone py-20" aria-label="جدول هزینه ها">
        <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-3 text-sm font-bold text-teal-2">
                  <span className="h-px w-10 bg-teal" aria-hidden />
                  جراحی های فک و صورت
                </p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">ارتوگناتیک، جنیوپلاستی و بایمکس</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-foreground/60">
                هزینه جراحی فک شامل بیهوشی، بستری و ویزیت های دوره نقاهت است و
                معمولا با درمان ارتودنسی قبل و بعد از عمل همراه می شود.
              </p>
            </div>
            <CostCards
              rows={JAW_COSTS}
              caption="هزینه جراحی های فک و صورت"
              category="jaw"
              phone={SITE.phone}
              phoneDisplay={SITE.phoneDisplay}
            />
          </Reveal>

          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-3 text-sm font-bold text-teal-2">
                  <span className="h-px w-10 bg-teal" aria-hidden />
                  ایمپلنت (کاشت دندان) و جراحی های دندانی
                </p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">برندهای معتبر جهانی و جراحی های همراه</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-foreground/60">
                قیمت هر واحد ایمپلنت شامل فیکسچر برند اصلی است؛ هزینه روکش و
                اباتمنت بر اساس نوع درمان نهایی محاسبه می شود.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
              <CostCards
                rows={IMPLANT_COSTS}
                caption="هزینه ایمپلنت و جراحی های دندانی"
                category="implant"
                phone={SITE.phone}
                phoneDisplay={SITE.phoneDisplay}
              />
              <div className="relative min-h-[280px] overflow-hidden rounded-3xl shadow-xl shadow-ink/5 ring-1 ring-ink/10 lg:min-h-0">
                <CinematicImage
                  src="/images/implant-cost.jpg"
                  alt="نمایش هزینه کاشت دندان و ایمپلنت"
                  priority
                  sizes="(max-width: 1024px) 100vw, 30vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" aria-hidden />
                <div className="absolute bottom-4 right-4 left-4 rounded-2xl bg-ink/75 p-4 text-white ring-1 ring-teal/30 backdrop-blur-md">
                  <p className="text-xs leading-6 text-white/85">
                    برای مقایسه برندها و انتخاب گزینه متناسب با بودجه، رادیوگرافی
                    خود را ارسال کنید تا نظر اولیه رایگان اعلام شود.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* نکات مهم قبل از تصمیم — کارت های سه بعدی */}
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  t: "چه چیزهایی در هزینه جراحی فک محاسبه شده؟",
                  d: "بیهوشی عمومی، بستری بیمارستان، پلاک های تیتانیوم و ویزیت های دوره نقاهت. ارتودنسی قبل و بعد از جراحی جدا محاسبه می شود.",
                },
                {
                  t: "چرا محدوده قیمت اعلام می شود؟",
                  d: "حجم جراحی، سختی پرونده و برند مواد مصرفی در هر بیمار متفاوت است؛ عدد دقیق فقط پس از آنالیز CBCT و معاینه حضوری معنا دارد.",
                },
                {
                  t: "امکان پرداخت مرحله ای چگونه است؟",
                  d: "پرداخت معمولا در دو مرحله انجام می شود (قبل و بعد از جراحی). جزئیات دقیق در مشاوره حضوری هماهنگ می شود.",
                },
              ].map((n, i) => (
                <TiltCard key={n.t} className="rounded-3xl" max={6}>
                  <div className="h-full rounded-3xl bg-card p-6 ring-1 ring-ink/10 transition-shadow duration-300 hover:shadow-xl hover:shadow-teal/10">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal/18 to-teal/6 text-sm font-black text-teal-3 ring-1 ring-teal/25" aria-hidden>
                      {toFa(i + 1)}
                    </span>
                    <h3 className="mt-4 text-sm font-black leading-6">{n.t}</h3>
                    <p className="mt-2 text-xs leading-6 text-foreground/60">{n.d}</p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-12">
              <FilmGrain opacity={0.06} />
              <span className="aurora-orb right-[-6%] top-[-30%] h-56 w-56 bg-[#c9a13b]/25" aria-hidden />
              <div className="relative">
                <h3 className="text-xl font-black sm:text-2xl">هزینه نهایی درمان شما چقدر است؟</h3>
                <p className="mt-4 max-w-[62ch] text-sm leading-8 text-white/70">
                  برای دریافت هزینه دقیق، عکس رادیوگرافی (OPG یا CBCT) خود را در
                  واتسپ ارسال کنید یا برای ویزیت حضوری نوبت رزرو نمایید. مشاوره
                  تلفنی اولیه رایگان است.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a href={`tel:${SITE.phone}`} className="rounded-full bg-teal px-8 py-4 text-sm font-black text-ink shadow-lg shadow-teal/30 transition hover:bg-gold-soft" dir="ltr">
                    {SITE.phoneDisplay}
                  </a>
                  <a
                    href={waLink(SITE.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/25 px-8 py-4 text-sm font-bold transition hover:bg-white/10"
                  >
                    ارسال رادیوگرافی در واتسپ
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
