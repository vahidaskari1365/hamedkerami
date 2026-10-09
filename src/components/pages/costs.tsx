"use client";

import Image from "next/image";
import { Reveal } from "@/components/cinematic";
import { PageHero } from "@/components/pages/about";
import { IMPLANT_COSTS, JAW_COSTS, SITE } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function CostTable({
  rows,
  caption,
}: {
  rows: { item: string; price: string }[];
  caption: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
      <Table>
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          <TableRow className="bg-ink hover:bg-ink">
            <TableHead className="h-12 text-right text-sm font-bold text-white">
              نوع خدمت
            </TableHead>
            <TableHead className="h-12 text-right text-sm font-bold text-white">
              هزینه تقریبی
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.item} className={i % 2 ? "bg-bone/60" : ""}>
              <TableCell className="py-4 font-semibold">{r.item}</TableCell>
              <TableCell className="py-4">
                <span className="rounded-full bg-teal/10 px-4 py-1.5 text-sm font-bold text-teal-3">
                  {r.price}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CostsPage() {
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
            <CostTable rows={JAW_COSTS} caption="هزینه جراحی های فک و صورت" />
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
              <CostTable rows={IMPLANT_COSTS} caption="هزینه ایمپلنت و جراحی های دندانی" />
              <div className="relative min-h-[280px] overflow-hidden rounded-2xl shadow-sm">
                <Image
                  src="/images/implant-cost.jpg"
                  alt="نمایش هزینه کاشت دندان و ایمپلنت"
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-3xl bg-ink p-8 text-white sm:p-12">
              <h3 className="text-xl font-black sm:text-2xl">
                هزینه نهایی درمان شما چقدر است؟
              </h3>
              <p className="mt-4 max-w-[62ch] text-sm leading-8 text-white/70">
                برای دریافت هزینه دقیق، عکس رادیوگرافی (OPG یا CBCT) خود را در
                واتسپ ارسال کنید یا برای ویزیت حضوری نوبت رزرو نمایید. مشاوره
                تلفنی اولیه رایگان است.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href={`tel:${SITE.phone}`} className="rounded-full bg-teal px-8 py-4 text-sm font-bold shadow-lg shadow-teal/25 transition hover:bg-teal-2" dir="ltr">
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
