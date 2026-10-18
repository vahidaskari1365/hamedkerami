"use client";

import Image from "next/image";
import { Reveal } from "@/components/cinematic";
import { PageHero } from "@/components/pages/about";
import { useContent } from "@/lib/content-context";

/* ============================================================
   صفحه هزینه ها — جدول قیمت پرمیوم Kinpaku
   دسکتاپ: جدول با ردیف های zivory + هایلایت پرتقاضاترین
   موبایل: کارت های فشرده با خط نقطه چین (leader dots)
   ============================================================ */

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

function PriceRow({
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
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl p-4 transition-colors sm:flex-row sm:items-center sm:gap-0 sm:rounded-none sm:px-6 ${
        highlight
          ? "bg-gradient-to-l from-teal/12 via-teal/5 to-transparent ring-1 ring-teal/35 sm:ring-0"
          : index % 2
            ? "bg-bone/50"
            : ""
      }`}
    >
      <div className="flex flex-1 items-start gap-3">
        {highlight ? (
          <span className="mt-0.5 shrink-0 rounded-full bg-teal px-2.5 py-0.5 text-[10px] font-black text-ink">
            پرتقاضاترین
          </span>
        ) : null}
        <span className="text-[15px] font-semibold leading-7 sm:font-bold">{item}</span>
      </div>
      <span className="price-leader hidden sm:block" aria-hidden />
      <span
        className={`w-fit rounded-full px-4 py-1.5 text-sm font-black ${
          highlight
            ? "bg-teal text-ink shadow-sm shadow-teal/40"
            : "bg-teal/10 text-teal-3"
        }`}
      >
        {price}
      </span>
    </div>
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
  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-ink/10" role="table" aria-label={caption}>
      {/* header strip */}
      <div className="relative flex items-center justify-between bg-ink px-6 py-4 text-white">
        <span className="flex items-center gap-2.5 text-sm font-bold">
          <span className="h-px w-7 bg-teal" aria-hidden />
          نوع خدمت
        </span>
        <span className="text-sm font-bold">هزینه تقریبی</span>
      </div>
      <div className="divide-y divide-ink/6 sm:divide-y-0" role="rowgroup">
        {rows.map((r, i) => (
          <PriceRow
            key={r.item}
            item={r.item}
            price={r.price}
            index={i}
            highlight={highlights.includes(r.item)}
          />
        ))}
      </div>
      <div className="border-t border-dashed border-ink/15 px-6 py-3.5 text-center text-xs leading-6 text-foreground/50">
        {caption} — هزینه دقیق پس از معاینه و بررسی رادیوگرافی اعلام می شود
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
              <div className="relative min-h-[280px] overflow-hidden rounded-3xl shadow-sm ring-1 ring-ink/10">
                <Image
                  src="/images/implant-cost.jpg"
                  alt="نمایش هزینه کاشت دندان و ایمپلنت"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" aria-hidden />
                <div className="absolute bottom-4 right-4 left-4 rounded-2xl bg-ink/70 p-4 text-white backdrop-blur-md ring-1 ring-teal/30">
                  <p className="text-xs leading-6 text-white/85">
                    برای مقایسه برندها و انتخاب گزینه متناسب با بودجه، رادیوگرافی
                    خود را ارسال کنید تا نظر اولیه رایگان اعلام شود.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* نکات مهم قبل از تصمیم */}
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
                <div key={n.t} className="rounded-3xl bg-card p-6 ring-1 ring-ink/10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/12 text-sm font-black text-teal-3" aria-hidden>
                    {toFa(i + 1)}
                  </span>
                  <h3 className="mt-4 text-sm font-black leading-6">{n.t}</h3>
                  <p className="mt-2 text-xs leading-6 text-foreground/60">{n.d}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-12">
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
                    href={`https://wa.me/${SITE.whatsapp}`}
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
