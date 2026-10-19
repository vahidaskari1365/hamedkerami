"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, TiltCard, CinematicImage, FilmGrain } from "@/components/cinematic";
import { PageHero } from "@/components/pages/about";
import { AnimatedShinyText } from "@/components/magicui";
import { useContent } from "@/lib/content-context";
import { waLink, faToEnDigits } from "@/lib/data";

/* ============================================================
   صفحه هزینه ها — نسخه گرافیکی سینمایی Kinpaku
   ۱) جداول: هر ردیف علاوه بر شماره و پیل قیمت، «نوار بازه
      قیمتی» گرافیکی دارد که جای هزینه را روی مقیاس دسته
      نشان می دهد (دسکتاپ جایگزین خط نقطه چین، موبایل زیر پیل)
   ۲) نمودار مقایسه: پنل تیره سینمایی با نوارهای بازه ای
      متحرک، خطوط راهنما، برق نوار پرتقاضاترین و خط کش
      میلیون تومان
   آیتم های بدون عدد (رویژن، GBR) به شکل نوار شبح «با تماس»
   رندر می شوند و ساختار جدول برای سئو دست نخورده می ماند.
   ============================================================ */

/* ---------- تجزیه «۹۰ تا ۱۱۰ میلیون تومان» → {min,max} ---------- */
function parsePriceRange(price: string): { min: number; max: number } | null {
  const nums = (faToEnDigits(price).match(/\d+(?:\.\d+)?/g) ?? [])
    .map(Number)
    .filter((n) => n > 0 && n < 100000);
  if (!nums.length) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return { min, max };
}

type Parsed = { min: number; max: number } | null;

/* ردیف های پرتقاضاترین — با نشان ویژه هایلایت می شوند */
const HIGHLIGHTS: Record<string, string[]> = {
  jaw: ["جراحی دو فک (جراحی بایمکس)", "جراحی چانه (جنیوپلاستی)"],
  implant: ["ایمپلنت DXL آلمان", "جراحی دندان عقل"],
};

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const toFa = (n: number) =>
  String(n)
    .split("")
    .map((d) => FA_DIGITS[Number(d)] ?? d)
    .join("");

const EASE = [0.22, 1, 0.36, 1] as const;

/* نوار بازه قیمتی — مشترک بین ردیف جدول و نمودار */
function Band({
  min,
  max,
  scaleMax,
  highlight,
  delay,
  thick = false,
}: {
  min: number;
  max: number;
  scaleMax: number;
  highlight: boolean;
  delay: number;
  thick?: boolean;
}) {
  const single = min === max;
  const startPct = single ? 0 : (min / scaleMax) * 100;
  const widthPct = single ? (max / scaleMax) * 100 : Math.max(((max - min) / scaleMax) * 100, 6);
  return (
    <motion.span
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 1.05, delay, ease: EASE }}
      style={{
        right: `${startPct}%`,
        width: `${widthPct}%`,
        transformOrigin: "right",
      }}
      className={`absolute top-0 rounded-full ${
        thick ? "h-full" : "h-full"
      } ${
        highlight
          ? "bg-gradient-to-l from-gold-soft via-teal to-teal-2 shadow-[0_0_18px_rgba(201,161,59,0.55)]"
          : "bg-gradient-to-l from-teal/85 via-teal-2 to-teal-3 shadow-[0_0_10px_rgba(124,97,32,0.35)]"
      }`}
    >
      {/* سر درخشان در انتهای نوار (لبه ارزش بیشینه) */}
      <span
        aria-hidden
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-gold-soft ${
          thick ? "-left-1.5 h-3 w-3 shadow-[0_0_12px_rgba(233,207,135,0.95)]" : "-left-1 h-2 w-2 shadow-[0_0_8px_rgba(233,207,135,0.8)]"
        }`}
      />
      {highlight && thick && <span aria-hidden className="shimmer-x absolute inset-0 rounded-full" />}
    </motion.span>
  );
}

/* نوار کوچک داخل ردیف جدول — دسکتاپ جایگزین leader dots */
function MiniRange({
  parsed,
  scaleMax,
  highlight,
  delay,
  mobile = false,
}: {
  parsed: Parsed;
  scaleMax: number;
  highlight: boolean;
  delay: number;
  mobile?: boolean;
}) {
  if (!parsed) {
    if (mobile) return null;
    return <span className="price-leader hidden sm:block" aria-hidden />;
  }
  return (
    <span
      aria-hidden
      className={
        mobile
          ? "relative block h-1.5 w-full sm:hidden"
          : "relative hidden h-1.5 min-w-[80px] flex-1 sm:block"
      }
    >
      <span className="absolute inset-0 rounded-full bg-ink/[0.08]" />
      <span className="absolute inset-y-0 right-1/2 w-px bg-ink/10" />
      <Band
        min={parsed.min}
        max={parsed.max}
        scaleMax={scaleMax}
        highlight={highlight}
        delay={delay}
      />
    </span>
  );
}

const rowVariants = {
  hidden: { opacity: 0, x: 32, filter: "blur(4px)" },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, delay: i * 0.06, ease: EASE },
  }),
};

function PriceRow({
  item,
  price,
  parsed,
  scaleMax,
  index,
  highlight,
}: {
  item: string;
  price: string;
  parsed: Parsed;
  scaleMax: number;
  index: number;
  highlight: boolean;
}) {
  return (
    <motion.div
      custom={index % 6}
      variants={rowVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className={`group relative flex flex-col gap-2.5 rounded-2xl transition-colors duration-300 sm:flex-row sm:items-center sm:gap-0 sm:rounded-none sm:px-6 ${
        highlight
          ? "bg-gradient-to-l from-teal/14 via-teal/6 to-transparent sm:ring-1 sm:ring-inset sm:ring-teal/30"
          : "hover:bg-teal/[0.045]"
      } ${index % 2 && !highlight ? "bg-bone/50 sm:bg-bone/40" : ""} ${!highlight && index % 2 ? "sm:hover:bg-teal/[0.05]" : ""}`}
    >
      {/* خط طلایی کنار ردیف در هاور — دسکتاپ */}
      <span
        aria-hidden
        className="absolute inset-y-2 right-0 hidden w-[3px] rounded-full bg-gradient-to-b from-gold-soft via-teal to-teal-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block"
      />
      <div className="flex flex-1 items-start gap-3 sm:items-center">
        {/* شماره ردیف */}
        <span
          aria-hidden
          className={`mt-0.5 hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black tabular-nums sm:flex ${
            highlight ? "bg-teal text-ink shadow-sm shadow-teal/40" : "bg-ink/6 text-foreground/45 group-hover:bg-teal/15 group-hover:text-teal-3"
          } transition-colors`}
        >
          {toFa(index + 1).padStart(2, "۰")}
        </span>
        {highlight ? (
          <span className="mt-0.5 shrink-0 rounded-full bg-teal px-2.5 py-1 text-[10px] font-black text-ink shadow-sm shadow-teal/40 sm:mt-0">
            <AnimatedShinyText className="text-[10px] font-black text-ink">
              پرتقاضاترین ✦
            </AnimatedShinyText>
          </span>
        ) : null}
        <span className="text-[15px] font-semibold leading-7 sm:font-bold">{item}</span>
      </div>
      {/* نوار گرافیکی بازه قیمتی — دسکتاپ */}
      <MiniRange parsed={parsed} scaleMax={scaleMax} highlight={highlight} delay={(index % 6) * 0.07} />
      <span
        className={`w-fit rounded-full px-4 py-1.5 text-sm font-black tabular-nums transition-all duration-300 ${
          highlight
            ? "bg-gradient-to-l from-gold-soft via-teal to-teal-2 text-ink shadow-md shadow-teal/40 group-hover:scale-[1.04] group-hover:shadow-lg group-hover:shadow-teal/50"
            : "bg-teal/10 text-teal-3 group-hover:bg-teal group-hover:text-ink group-hover:shadow-md group-hover:shadow-teal/30"
        }`}
      >
        {price}
      </span>
      {/* نوار گرافیکی — موبایل زیر پیل قیمت */}
      <MiniRange parsed={parsed} scaleMax={scaleMax} highlight={highlight} delay={(index % 6) * 0.07} mobile />
    </motion.div>
  );
}

function CostTable({
  rows,
  caption,
  category,
}: {
  rows: { item: string; price: string }[];
  caption: string;
  category: "jaw" | "implant";
}) {
  const highlights = HIGHLIGHTS[category] ?? [];
  const parsedRows = rows.map((r) => ({ ...r, parsed: parsePriceRange(r.price) }));
  const scaleMax = Math.max(
    ...parsedRows.filter((r) => r.parsed).map((r) => r.parsed!.max)
  );
  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-card shadow-xl shadow-ink/5 ring-1 ring-ink/10"
      role="table"
      aria-label={caption}
    >
      {/* خط طلایی بالای جدول */}
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-l from-transparent via-teal to-transparent" />
      {/* header strip */}
      <div className="relative flex items-center justify-between bg-ink px-6 py-4 text-white">
        <FilmGrain opacity={0.07} />
        <span className="relative flex items-center gap-2.5 text-sm font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal/15 ring-1 ring-teal/40" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e9cf87" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </span>
          نوع خدمت
        </span>
        <span className="relative text-sm font-bold text-gold-soft">هزینه تقریبی (تومان)</span>
      </div>
      <div className="divide-y divide-ink/6 py-1 sm:divide-y-0" role="rowgroup">
        {parsedRows.map((r, i) => (
          <PriceRow
            key={r.item}
            item={r.item}
            price={r.price}
            parsed={r.parsed}
            scaleMax={scaleMax}
            index={i}
            highlight={highlights.includes(r.item)}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-dashed border-ink/15 bg-bone/40 px-6 py-3.5 text-center text-xs leading-6 text-foreground/50">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-teal-2" aria-hidden>
          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
        </svg>
        {caption} — هزینه دقیق پس از معاینه و بررسی رادیوگرافی اعلام می شود
      </div>
    </div>
  );
}

/* ============================================================
   نمودار مقایسه گرافیکی — پنل سینمایی تیره با نوارهای بازه ای
   ============================================================ */
function GraphRow({
  item,
  parsed,
  scaleMax,
  highlight,
  index,
}: {
  item: string;
  parsed: Parsed;
  scaleMax: number;
  highlight: boolean;
  index: number;
}) {
  return (
    <div
      className={`group -mx-2 flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors duration-300 hover:bg-white/[0.04] sm:mx-0 sm:gap-5 sm:px-3 ${
        highlight ? "bg-white/[0.05]" : ""
      }`}
    >
      <span
        className={`w-[7.5rem] shrink-0 text-[11px] font-bold leading-5 transition-colors group-hover:text-white sm:w-48 sm:text-xs ${
          highlight ? "text-white" : "text-white/70"
        }`}
      >
        {item}
      </span>
      {parsed ? (
        <span className="relative h-3.5 flex-1" aria-hidden>
          {/* خطوط راهنمای عمودی مقیاس */}
          <span className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-inset ring-white/10" />
          <span className="absolute inset-y-0 right-1/4 w-px bg-white/[0.06]" />
          <span className="absolute inset-y-0 right-1/2 w-px bg-white/[0.09]" />
          <span className="absolute inset-y-0 right-3/4 w-px bg-white/[0.06]" />
          <Band
            min={parsed.min}
            max={parsed.max}
            scaleMax={scaleMax}
            highlight={highlight}
            delay={index * 0.09}
            thick
          />
        </span>
      ) : (
        <span
          className="relative flex h-6 flex-1 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-inset ring-dashed ring-white/15"
          aria-hidden
        >
          <span className="text-[9px] font-semibold text-white/40 sm:text-[10px]">
            با تماس اعلام می شود
          </span>
        </span>
      )}
      <span
        aria-hidden
        className="w-[4.5rem] shrink-0 text-left text-[11px] font-black tabular-nums text-gold-soft sm:w-24 sm:text-xs"
      >
        {parsed ? (parsed.min === parsed.max ? toFa(parsed.min) : `${toFa(parsed.min)} تا ${toFa(parsed.max)}`) : "—"}
      </span>
    </div>
  );
}

function PriceGraph({
  title,
  rows,
  highlights,
  ariaLabel,
}: {
  title: string;
  rows: { item: string; price: string }[];
  highlights: string[];
  ariaLabel: string;
}) {
  const parsedRows = rows.map((r) => ({ ...r, parsed: parsePriceRange(r.price) }));
  const scaleMax = Math.max(...parsedRows.filter((r) => r.parsed).map((r) => r.parsed!.max));
  const mid = Math.round(scaleMax / 2);
  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-ink p-5 text-white shadow-xl shadow-ink/20 ring-1 ring-white/10 sm:p-8"
      role="img"
      aria-label={`${ariaLabel} (مقیاس: میلیون تومان)`}
    >
      <FilmGrain opacity={0.07} />
      <span className="aurora-orb left-[-8%] top-[-40%] h-56 w-56 bg-[#c9a13b]/25" aria-hidden />
      <span className="aurora-orb bottom-[-45%] right-[-6%] h-48 w-48 bg-[#c9a13b]/15" aria-hidden />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2.5 text-sm font-black sm:text-base">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/15 ring-1 ring-teal/40" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9cf87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 16v-5M12 16V8M17 16v-2" />
              </svg>
            </span>
            {title}
          </p>
          <span className="rounded-full bg-white/5 px-3.5 py-1.5 text-[10px] font-bold text-gold-soft ring-1 ring-teal/30">
            واحد: میلیون تومان
          </span>
        </div>

        <div className="space-y-3.5">
          {parsedRows.map((r, i) => (
            <GraphRow
              key={r.item}
              item={r.item}
              parsed={r.parsed}
              scaleMax={scaleMax}
              highlight={highlights.includes(r.item)}
              index={i}
            />
          ))}
        </div>

        {/* خط کش مقیاس — هم تراز با ناحیه نوارها */}
        <div className="mt-5 flex items-center gap-3 sm:gap-5" aria-hidden>
          <span className="w-[7.5rem] shrink-0 sm:w-48" />
          <span className="flex flex-1 justify-between border-t border-dashed border-white/15 pt-2 text-[9px] tabular-nums text-white/40 sm:text-[10px]">
            <span>{toFa(0)}</span>
            <span>{toFa(mid)}</span>
            <span>{toFa(scaleMax)}</span>
          </span>
          <span className="w-[4.5rem] shrink-0 sm:w-24" />
        </div>

        {/* راهنما */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[10px] font-semibold text-white/50">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-7 rounded-full bg-gradient-to-l from-teal/85 via-teal-2 to-teal-3" aria-hidden />
            نوار شناور: محدوده هزینه
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-7 rounded-full bg-gradient-to-l from-gold-soft via-teal to-teal-2" aria-hidden />
            نوار طلایی: پرتقاضاترین
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold-soft shadow-[0_0_8px_rgba(233,207,135,0.8)]" aria-hidden />
            نوار از مبدأ: قیمت واحد / بیشینه
          </span>
        </div>
      </div>
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
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  ارتوگناتیک، جنیوپلاستی و بایمکس
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-foreground/60">
                هزینه جراحی فک شامل بیهوشی، بستری و ویزیت های دوره نقاهت است و
                معمولا با درمان ارتودنسی قبل و بعد از عمل همراه می شود.
              </p>
            </div>
            <CostTable rows={JAW_COSTS} caption="هزینه جراحی های فک و صورت" category="jaw" />
            <div className="mt-6">
              <PriceGraph
                title="نمودار مقایسه هزینه جراحی های فک و صورت"
                rows={JAW_COSTS}
                highlights={HIGHLIGHTS.jaw}
                ariaLabel="نمودار مقایسه هزینه جراحی های فک و صورت"
              />
            </div>
          </Reveal>

          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-3 text-sm font-bold text-teal-2">
                  <span className="h-px w-10 bg-teal" aria-hidden />
                  ایمپلنت (کاشت دندان) و جراحی های دندانی
                </p>
                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  برندهای معتبر جهانی و جراحی های همراه
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-foreground/60">
                قیمت هر واحد ایمپلنت شامل فیکسچر برند اصلی است؛ هزینه روکش و
                اباتمنت بر اساس نوع درمان نهایی محاسبه می شود.
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
              <CostTable rows={IMPLANT_COSTS} caption="هزینه ایمپلنت و جراحی های دندانی" category="implant" />
              <div className="relative min-h-[280px] overflow-hidden rounded-3xl shadow-xl shadow-ink/5 ring-1 ring-ink/10">
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
            <div className="mt-6">
              <PriceGraph
                title="نمودار مقایسه هزینه ایمپلنت و جراحی های دندانی"
                rows={IMPLANT_COSTS}
                highlights={HIGHLIGHTS.implant}
                ariaLabel="نمودار مقایسه هزینه ایمپلنت و جراحی های دندانی"
              />
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
                <h3 className="text-xl font-black sm:text-2xl">
                  هزینه نهایی درمان شما چقدر است؟
                </h3>
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
