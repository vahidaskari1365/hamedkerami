"use client";

/* ============================================================
   فرم نوبت‌دهی آنلاین — تقویم شمسی + انتخاب دکتر + بازه ساعت
   مراحل: ۱) انتخاب پزشک  ۲) انتخاب روز (فقط روزهای حضور همان پزشک)
   ۳) بازه ساعت و اطلاعات تماس  →  ثبت در پنل ادمین (pending)
   تاریخ‌ها کاملاً شمسی نمایش داده می‌شوند (تقویم و پیام‌ها).
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  APPOINTMENT_DOCTORS,
  APPOINTMENT_SLOTS,
  HOURS,
  SITE,
  waLink,
} from "@/lib/data";
import {
  JALALI_MONTHS,
  gregorianToJalali,
  jalaliMonthLength,
  jalaliToGregorian,
  localIsoDay,
  tehranToday,
} from "@/lib/jalali";

/* برچسب روز هفته بر اساس getDay جاوااسکریپت (۰=یکشنبه … ۶=شنبه) */
const DOW_LABELS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
/* سرستون تقویم — هفته ایرانی از شنبه شروع می‌شود */
const GRID_HEADS = [
  { label: "شنبه", dow: 6 },
  { label: "یکشنبه", dow: 0 },
  { label: "دوشنبه", dow: 1 },
  { label: "سه‌شنبه", dow: 2 },
  { label: "چهارشنبه", dow: 3 },
  { label: "پنجشنبه", dow: 4 },
  { label: "جمعه", dow: 5 },
];
const CLOSED_DOW = [4, 5]; // پنجشنبه و جمعه — مطب تعطیل
const MAX_AHEAD_DAYS = 75;

const faDay = (n: number) => n.toLocaleString("fa-IR", { useGrouping: false });

type Doctor = (typeof APPOINTMENT_DOCTORS)[number];

export function AppointmentClient() {
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [todayJ, setTodayJ] = useState<[number, number, number]>([0, 0, 0]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [view, setView] = useState<{ jy: number; jm: number }>({ jy: 0, jm: 0 });
  const [dayIso, setDayIso] = useState("");
  const [dayJalali, setDayJalali] = useState("");
  const [slot, setSlot] = useState(APPOINTMENT_SLOTS[2]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ dayJalali: string; doctor: string; slot: string } | null>(null);

  /* امروزِ تهران فقط سمت کلاینت محاسبه می‌شود تا با SSR اختلاف هیدریشن نیفتد
     (میکروتسک: بعد از هیدریشن و قبل از paint — بدون setState همگام در effect) */
  useEffect(() => {
    queueMicrotask(() => {
      const t = tehranToday();
      setToday(t);
      setTodayJ(gregorianToJalali(t.getFullYear(), t.getMonth() + 1, t.getDate()));
      setView({ jy: gregorianToJalali(t.getFullYear(), t.getMonth() + 1, t.getDate())[0], jm: gregorianToJalali(t.getFullYear(), t.getMonth() + 1, t.getDate())[1] });
      setMounted(true);
    });
  }, []);

  /* ---------- تقویم ماه جاری نمایش ---------- */
  const grid = useMemo(() => {
    if (!today || !view.jy) return null;
    const [gy, gm, gd] = jalaliToGregorian(view.jy, view.jm, 1);
    const first = new Date(gy, gm - 1, gd);
    const lead = (first.getDay() + 1) % 7; // شنبه → ستون صفر
    const len = jalaliMonthLength(view.jy, view.jm);
    const days = Array.from({ length: len }, (_, i) => {
      const d = i + 1;
      const date = new Date(gy, gm - 1, gd + i);
      const dow = date.getDay();
      const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
      const closed = CLOSED_DOW.includes(dow);
      const past = diff < 0;
      const tooFar = diff > MAX_AHEAD_DAYS;
      const noDoc = doctor ? !doctor.days.includes(dow) : false;
      return {
        d,
        iso: localIsoDay(date),
        dow,
        disabled: closed || past || tooFar || noDoc,
        isToday: localIsoDay(date) === localIsoDay(today),
        closed,
        noDoc,
      };
    });
    return { lead, days, first };
  }, [today, view, doctor]);

  const isCurrentMonth = view.jy === todayJ[0] && view.jm === todayJ[1];

  function shiftMonth(dir: 1 | -1) {
    setView((v) => {
      let jy = v.jy;
      let jm = v.jm + dir;
      if (jm > 12) {
        jm = 1;
        jy += 1;
      }
      if (jm < 1) {
        jm = 12;
        jy -= 1;
      }
      return { jy, jm };
    });
  }

  function pickDay(cell: { d: number; iso: string; dow: number; disabled: boolean }) {
    if (cell.disabled || !grid) return;
    setDayIso(cell.iso);
    setDayJalali(
      `${DOW_LABELS[cell.dow]} ${faDay(cell.d)} ${JALALI_MONTHS[view.jm - 1]} ${faDay(view.jy)}`,
    );
  }

  /* ---------- ارسال فرم ---------- */
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!doctor) return setError("لطفاً پزشک مورد نظر را انتخاب کنید");
    if (!dayIso) return setError("لطفاً روز نوبت را از تقویم انتخاب کنید");
    if (name.trim().length < 2) return setError("نام و نام خانوادگی را کامل وارد کنید");
    const digits = phone.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[\s-]/g, "");
    if (!/^0\d{10}$/.test(digits)) return setError("شماره موبایل معتبر وارد کنید (مثل ۰۹۱۲۳۴۵۶۷۸۹)");

    setBusy(true);
    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: digits,
          doctor: doctor.name,
          dayIso,
          slot,
          note: note.trim(),
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone({ dayJalali: data.dayJalali, doctor: data.doctor, slot: data.slot });
        /* رویداد GA4 — نرخ تبدیل فرم نوبت (SXO) */
        const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
        gtag?.("event", "appointment_request", { doctor: data.doctor });
      } else {
        setError(data.error || "ثبت نوبت انجام نشد — دوباره تلاش کنید");
      }
    } catch {
      setError("خطای ارتباط با سرور — دوباره تلاش کنید");
    } finally {
      setBusy(false);
    }
  }

  /* ---------- صفحه موفقیت ---------- */
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-ink/10 sm:p-10"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-teal">
          <CheckCircle2 size={34} />
        </div>
        <h2 className="mt-5 text-xl font-black text-ink">درخواست نوبت ثبت شد</h2>
        <p className="mt-3 text-sm leading-7 text-foreground/70">
          همکاران ما برای قطعی‌کردن نوبت با شما تماس می‌گیرند. خلاصه درخواست شما:
        </p>
        <div className="mt-5 space-y-2.5 rounded-2xl bg-bone p-5 text-sm text-right">
          <p><span className="font-black">پزشک:</span> {done.doctor}</p>
          <p><span className="font-black">روز:</span> {done.dayJalali}</p>
          <p><span className="font-black">بازه:</span> {done.slot}</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Button asChild className="gap-1.5">
            <a href={`tel:${SITE.phone}`} dir="ltr">
              <Phone size={15} />
              {SITE.phoneDisplay}
            </a>
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <a href={waLink(SITE.whatsapp)} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} />
              پیام در واتسپ
            </a>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-7">
        {/* ---------- گام ۱: انتخاب پزشک ---------- */}
        <section aria-labelledby="appt-doctor">
          <h2 id="appt-doctor" className="flex items-center gap-2 text-base font-black text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-xs font-black text-white">۱</span>
            انتخاب پزشک
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {APPOINTMENT_DOCTORS.map((d) => {
              const active = doctor?.name === d.name;
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => {
                    setDoctor(d);
                    /* اگر روز انتخابی با پزشک جدید ناسازگار شد، پاک می‌شود */
                    if (dayIso && today) {
                      const m = dayIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                      if (m) {
                        const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
                        if (!d.days.includes(dt.getDay())) {
                          setDayIso("");
                          setDayJalali("");
                        }
                      }
                    }
                  }}
                  aria-pressed={active}
                  className={`flex items-center gap-3 rounded-2xl p-3.5 text-right ring-1 transition ${
                    active
                      ? "bg-teal/8 ring-2 ring-teal shadow-md shadow-teal/10"
                      : "bg-white ring-ink/10 hover:ring-teal/40"
                  }`}
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-teal/25">
                    <Image src={d.image} alt={d.name} fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-ink">{d.name}</span>
                    <span className="mt-0.5 block text-[11px] text-foreground/60">{d.role}</span>
                    <span className="mt-1 block text-[11px] font-bold text-teal-3">
                      {d.days.map((w) => DOW_LABELS[w]).join(" و ")}
                    </span>
                  </span>
                  {active && <CheckCircle2 size={18} className="mr-auto shrink-0 text-teal" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- گام ۲: تقویم شمسی ---------- */}
        <section aria-labelledby="appt-calendar">
          <h2 id="appt-calendar" className="flex items-center gap-2 text-base font-black text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-xs font-black text-white">۲</span>
            انتخاب روز
          </h2>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/10 sm:p-5">
            {/* سربرگ ماه */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                disabled={isCurrentMonth}
                aria-label="ماه قبل"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-bone text-foreground/70 transition hover:bg-teal/10 hover:text-teal disabled:opacity-30 disabled:hover:bg-bone disabled:hover:text-foreground/70"
              >
                <ChevronRight size={17} />
              </button>
              <p className="text-sm font-black text-ink">
                {view.jy ? `${JALALI_MONTHS[view.jm - 1]} ${faDay(view.jy)}` : "…"}
              </p>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                disabled={!today || !view.jy ? true : monthLimitReached(view, today)}
                aria-label="ماه بعد"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-bone text-foreground/70 transition hover:bg-teal/10 hover:text-teal disabled:opacity-30 disabled:hover:bg-bone disabled:hover:text-foreground/70"
              >
                <ChevronLeft size={17} />
              </button>
            </div>

            {/* سرستون روزها */}
            <div className="mt-4 grid grid-cols-7 gap-1 text-center">
              {GRID_HEADS.map((h) => (
                <span key={h.label} className="py-1.5 text-[10.5px] font-black text-foreground/45">
                  {h.label}
                </span>
              ))}
            </div>

            {/* خانه‌های روز */}
            {mounted && grid ? (
              <div className="mt-1 grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: grid.lead }).map((_, i) => (
                  <span key={`lead-${i}`} />
                ))}
                {grid.days.map((cell) => {
                  const selected = dayIso === cell.iso;
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      disabled={cell.disabled}
                      onClick={() => pickDay(cell)}
                      title={
                        cell.closed
                          ? "مطب تعطیل است"
                          : cell.noDoc && doctor
                            ? `${doctor.name} در ${DOW_LABELS[cell.dow]} مطب نیست`
                            : undefined
                      }
                      aria-label={`${DOW_LABELS[cell.dow]} ${faDay(cell.d)} ${JALALI_MONTHS[view.jm - 1]}`}
                      aria-pressed={selected}
                      className={`relative aspect-square rounded-xl text-[13px] font-bold transition ${
                        selected
                          ? "bg-teal text-white shadow-md shadow-teal/30"
                          : cell.disabled
                            ? "cursor-not-allowed text-foreground/20"
                            : "bg-bone/70 text-foreground/80 hover:bg-teal/10 hover:text-teal"
                      }`}
                    >
                      {faDay(cell.d)}
                      {cell.isToday && !selected ? (
                        <span className="absolute inset-x-4 bottom-1 h-[2.5px] rounded-full bg-teal/60" aria-hidden />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-1 grid h-56 animate-pulse grid-cols-7 gap-1" aria-hidden>
                {Array.from({ length: 35 }).map((_, i) => (
                  <span key={i} className="rounded-xl bg-bone/60" />
                ))}
              </div>
            )}

            {/* راهنما */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-ink/8 pt-3 text-[11px] text-foreground/55">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-teal" /> روز انتخابی
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-[2.5px] w-3 rounded-full bg-teal/60" /> امروز
              </span>
              <span>روزهای خاکستری: تعطیل یا خارج از روزهای حضور پزشک</span>
            </div>
            {doctor && dayJalali ? (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-teal/8 px-4 py-3 text-sm font-bold text-ink">
                <CalendarCheck size={16} className="shrink-0 text-teal" />
                {dayJalali}
              </p>
            ) : null}
          </div>
        </section>

        {/* ---------- گام ۳: بازه ساعت و اطلاعات ---------- */}
        <section aria-labelledby="appt-form">
          <h2 id="appt-form" className="flex items-center gap-2 text-base font-black text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-xs font-black text-white">۳</span>
            بازه ساعت و اطلاعات تماس
          </h2>

          <div className="mt-4">
            <p className="mb-2 text-xs font-bold text-foreground/60">بازه ساعت مراجعه (مطب ۱۵ تا ۱۹ باز است)</p>
            <div className="flex flex-wrap gap-2">
              {APPOINTMENT_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  aria-pressed={slot === s}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold ring-1 transition ${
                    slot === s
                      ? "bg-ink text-white ring-ink shadow"
                      : "bg-white text-foreground/70 ring-ink/12 hover:ring-teal/40"
                  }`}
                >
                  <Clock size={13} />
                  {s}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/10 sm:grid-cols-2 sm:p-6">
            <div>
              <Label htmlFor="appt-name">نام و نام خانوادگی *</Label>
              <Input
                id="appt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder="مثلاً سارا محمدی"
                className="mt-1.5"
                autoComplete="name"
                required
              />
            </div>
            <div>
              <Label htmlFor="appt-phone">شماره موبایل *</Label>
              <Input
                id="appt-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                dir="ltr"
                maxLength={13}
                placeholder="09123456789"
                className="mt-1.5 text-right"
                autoComplete="tel"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="appt-note">توضیح (اختیاری)</Label>
              <textarea
                id="appt-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1500}
                rows={3}
                placeholder="مثلاً عکس رادیوگرافی دارم، یا درخواست مشاوره جراحی فک دارم…"
                className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>
            {/* تله ربات — مخفی برای کاربر */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            {error ? (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 sm:col-span-2" role="alert">
                {error}
              </p>
            ) : null}
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" className="w-full gap-2 text-base" disabled={busy}>
                {busy ? <Loader2 size={17} className="animate-spin" /> : <CalendarCheck size={17} />}
                ثبت درخواست نوبت
              </Button>
              <p className="mt-3 text-center text-[11px] leading-5 text-foreground/45">
                ثبت درخواست به معنی قطعی‌شدن نوبت نیست؛ همکاران مطب برای تأیید نهایی با شما تماس می‌گیرند.
              </p>
            </div>
          </form>
        </section>
      </div>

      {/* ---------- ستون کنار: اطلاعات مطب ---------- */}
      <aside className="space-y-4">
        <div className="rounded-2xl bg-ink p-6 text-white">
          <p className="flex items-center gap-2 text-sm font-black text-gold-soft">
            <Clock size={16} />
            ساعات کاری مطب
          </p>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            {HOURS.map((h) => (
              <li key={h.day} className="flex items-center justify-between gap-2 border-b border-white/8 pb-2 last:border-0">
                <span className="text-white/85">
                  {h.day}
                  {h.doctor && <span className="text-white/45"> — {h.doctor}</span>}
                </span>
                <span className={h.time === "تعطیل" ? "text-red-300" : "font-bold text-gold-soft"}>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
          <p className="flex items-center gap-2 text-sm font-black text-ink">
            <MapPin size={16} className="text-teal" />
            آدرس مطب
          </p>
          <p className="mt-3 text-[13px] leading-7 text-foreground/70">{SITE.address}</p>
          <a
            href={SITE.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs font-bold text-teal-3 hover:underline"
          >
            مشاهده روی نقشه →
          </a>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
          <p className="flex items-center gap-2 text-sm font-black text-ink">
            <UserRound size={16} className="text-teal" />
            رزرو تلفنی
          </p>
          <p className="mt-3 text-[13px] leading-7 text-foreground/70">
            اگر روز دلخواه شما در تقویم نیست، با مطب تماس بگیرید:
          </p>
          <a href={`tel:${SITE.phone}`} dir="ltr" className="mt-3 flex items-center gap-2 text-sm font-black text-teal-3" >
            <Phone size={15} />
            {SITE.phoneDisplay}
          </a>
        </div>

        <div className="flex gap-3 rounded-2xl bg-gold-soft/10 p-5 ring-1 ring-gold-soft/30">
          <Info size={18} className="mt-0.5 shrink-0 text-teal-3" />
          <p className="text-xs leading-6 text-foreground/70">
            برای مشاوره جراحی فک، ارسال رادیوگرافی و عکس‌های پرونده در واتسپ هم می‌توانید پیام دهید تا
            پیش از مراجعه بررسی شود.
          </p>
        </div>
      </aside>
    </div>
  );
}

/* آیا ناوبری به ماه بعد مجاز است؟ (نمایش حداکثر تا سقف افق رزرو) */
function monthLimitReached(
  view: { jy: number; jm: number },
  today: Date,
): boolean {
  let jy = view.jy;
  let jm = view.jm + 1;
  if (jm > 12) {
    jm = 1;
    jy += 1;
  }
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, 1);
  const first = new Date(gy, gm - 1, gd);
  return first.getTime() - today.getTime() > MAX_AHEAD_DAYS * 86400000;
}
