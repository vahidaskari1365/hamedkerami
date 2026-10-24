"use client";

/* ============================================================
   EnAppointmentForm — فرم رزرو صفحات انگلیسی (LTR)
   همان API و همان جدول نوبت‌های فارسی را تغذیه می‌کند:
   POST /api/appointment — پزشک با نام رسمی فارسی ارسال می‌شود،
   روز به‌صورت dayIso میلادی (برای بیمار خارجی طبیعی‌تر)، و
   dayJalali را سرور برای پنل ادمین تولید می‌کند.
   منبع رزرو با پیشوند [EN] در فیلد یادداشت در پنل مشخص است.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE } from "@/lib/data";
import { localIsoDay, tehranToday } from "@/lib/jalali";
import { EN_CLINIC, EN_DOCTORS, EN_SLOTS } from "@/lib/en-content";

const CLOSED_DOW = [4, 5]; // Thu & Fri — clinic closed
const MAX_AHEAD_DAYS = 75;
const OPTIONS_COUNT = 30;

/* نگاشت خطاهای فارسی سرور به پیام انگلیسی */
function enError(raw: string): string {
  const m: [RegExp, string][] = [
    [/تعداد درخواست/, "Too many requests — please try again in a few minutes."],
    [/نام باید/, "Please enter your full name (at least 2 characters)."],
    [/شماره موبایل/, "Please enter a valid phone number."],
    [/پزشک انتخابی/, "The selected doctor is not available — please pick again."],
    [/روز گذشته/, "That date has already passed — please choose a future date."],
    [/فقط تا/, "Bookings are only open for the next 75 days — please choose a closer date."],
    [/تعطیل است/, "The clinic is closed on Thursdays and Fridays."],
    [/مطب نیست/, "The selected doctor does not attend on that day — please choose another date."],
    [/روز نامعتبر/, "Invalid date — please choose from the list."],
    [/خطای سرور/, "A server error occurred — please try again or contact us on WhatsApp."],
  ];
  for (const [re, msg] of m) if (re.test(raw)) return msg;
  return "Something went wrong — please try again or contact us on WhatsApp.";
}

type Doctor = (typeof EN_DOCTORS)[number];

export function EnAppointmentForm() {
  const [mounted, setMounted] = useState(false);
  const [doctor, setDoctor] = useState<Doctor>(EN_DOCTORS[0]);
  const [dayIso, setDayIso] = useState("");
  const [slot, setSlot] = useState(EN_SLOTS[2]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ doctorEn: string; dayLabel: string; slot: string } | null>(null);

  /* روزهای کاری آینده — فقط سمت کلاینت تا با SSR اختلاف نیفتد */
  const [options, setOptions] = useState<{ iso: string; label: string }[]>([]);

  useEffect(() => {
    const today = tehranToday();
    const list: { iso: string; label: string }[] = [];
    for (let i = 1; i <= MAX_AHEAD_DAYS && list.length < OPTIONS_COUNT; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const dow = d.getDay();
      if (CLOSED_DOW.includes(dow)) continue;
      if (!doctor.days.includes(dow)) continue;
      const label = d.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      list.push({ iso: localIsoDay(d), label });
    }
    /* میکروتسک — محاسبه تاریخ فقط سمت کلاینت است (اختلاف هیدریشن با SSR
       نمی‌افتد) و setState همگام در بدنه effect هم نداریم (react-compiler) */
    queueMicrotask(() => {
      setOptions(list);
      setMounted(true);
    });
  }, [doctor]);

  const selectedLabel = useMemo(
    () => options.find((o) => o.iso === dayIso)?.label ?? "",
    [options, dayIso],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!dayIso) return setError("Please choose a preferred date.");
    if (name.trim().length < 2) return setError("Please enter your full name.");
    const digits = phone
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[\s()-]/g, "");
    if (!/^(\+?\d{8,15}|0\d{10})$/.test(digits)) {
      return setError("Please enter a valid phone number — including the country code for international numbers (e.g. +49…).");
    }

    setBusy(true);
    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: digits,
          doctor: doctor.fa, /* نام رسمی فارسی — پنل ادمین فارسی می‌ماند */
          dayIso,
          slot,
          note: `[EN] ${note.trim()}`, /* نشانگر منبع رزرو در پنل ادمین */
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone({ doctorEn: doctor.name, dayLabel: selectedLabel, slot });
        const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
        gtag?.("event", "appointment_request", { doctor: doctor.fa, source: "en" });
      } else {
        setError(enError(String(data.error || "")));
      }
    } catch {
      setError("Could not reach the server — please try again or contact us on WhatsApp.");
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
        <h2 className="mt-5 text-xl font-black text-ink">Your request has been received</h2>
        <p className="mt-3 text-sm leading-7 text-foreground/70">
          Our clinic staff will call or message you to confirm the exact appointment time.
          Here is a summary of your request:
        </p>
        <div className="mt-5 space-y-2.5 rounded-2xl bg-bone p-5 text-sm text-left">
          <p><span className="font-black">Doctor:</span> {done.doctorEn}</p>
          <p><span className="font-black">Date:</span> {done.dayLabel}</p>
          <p><span className="font-black">Time:</span> {done.slot}</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Button asChild className="gap-1.5">
            <a href={`tel:${SITE.phone}`} className="ltr-num">
              <Phone size={15} />
              {EN_CLINIC.phoneDisplay}
            </a>
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <a href={EN_CLINIC.whatsappText} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} />
              WhatsApp
            </a>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-7">
        {/* ---------- گام ۱: پزشک ---------- */}
        <section aria-labelledby="en-appt-doctor">
          <h2 id="en-appt-doctor" className="flex items-center gap-2 text-base font-black text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-xs font-black text-white">1</span>
            Choose your doctor
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {EN_DOCTORS.map((d) => {
              const active = doctor.name === d.name;
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => {
                    setDoctor(d);
                    setDayIso("");
                  }}
                  aria-pressed={active}
                  className={`flex items-center gap-3 rounded-2xl p-3.5 text-left ring-1 transition ${
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
                    <span className="mt-1 block text-[11px] font-bold text-teal-3">{d.daysEn}</span>
                  </span>
                  {active && <CheckCircle2 size={18} className="ml-auto shrink-0 text-teal" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- گام ۲: روز ---------- */}
        <section aria-labelledby="en-appt-date">
          <h2 id="en-appt-date" className="flex items-center gap-2 text-base font-black text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-xs font-black text-white">2</span>
            Preferred date
          </h2>
          <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/10">
            <Label htmlFor="en-appt-day">Next {OPTIONS_COUNT} available clinic days</Label>
            {!mounted ? (
              <div className="mt-2 h-11 animate-pulse rounded-md bg-bone" aria-hidden />
            ) : (
              <select
                id="en-appt-day"
                value={dayIso}
                onChange={(e) => setDayIso(e.target.value)}
                className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">Choose a date…</option>
                {options.map((o) => (
                  <option key={o.iso} value={o.iso}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-3 flex items-center gap-2 text-[11px] leading-5 text-foreground/55">
              <Clock size={13} className="shrink-0 text-teal" />
              The clinic is closed on Thursdays and Fridays. Listed days match your selected
              doctor&apos;s attendance.
            </p>
            {dayIso && selectedLabel ? (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-teal/8 px-4 py-3 text-sm font-bold text-ink">
                <CalendarCheck size={16} className="shrink-0 text-teal" />
                {selectedLabel}
              </p>
            ) : null}
          </div>
        </section>

        {/* ---------- گام ۳: اطلاعات ---------- */}
        <section aria-labelledby="en-appt-form">
          <h2 id="en-appt-form" className="flex items-center gap-2 text-base font-black text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-xs font-black text-white">3</span>
            Your details
          </h2>

          <div className="mt-4">
            <p className="mb-2 text-xs font-bold text-foreground/60">Preferred time (clinic hours: 3–7 PM)</p>
            <div className="flex flex-wrap gap-2">
              {EN_SLOTS.map((s) => (
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
              <Label htmlFor="en-appt-name">Full name *</Label>
              <Input
                id="en-appt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder="e.g. Sara Ahmadi"
                className="mt-1.5"
                autoComplete="name"
                required
              />
            </div>
            <div>
              <Label htmlFor="en-appt-phone">Phone / WhatsApp *</Label>
              <Input
                id="en-appt-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                maxLength={18}
                placeholder="+49 170 1234567"
                className="mt-1.5"
                autoComplete="tel"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="en-appt-note">Message (optional)</Label>
              <textarea
                id="en-appt-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1500}
                rows={3}
                placeholder="e.g. I have a panoramic X-ray and would like a jaw surgery consultation…"
                className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>
            {/* تله ربات */}
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
                Request appointment
              </Button>
              <p className="mt-3 text-center text-[11px] leading-5 text-foreground/45">
                Submitting this form does not confirm a final appointment — our staff will
                contact you to confirm. Your details are used only for appointment
                coordination.
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
            Clinic hours
          </p>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            {EN_CLINIC.hours.map((h) => (
              <li key={h.day} className="flex items-center justify-between gap-2 border-b border-white/8 pb-2 last:border-0">
                <span className="text-white/85">
                  {h.day}
                  {h.doctor && <span className="block text-[11px] text-white/45">{h.doctor}</span>}
                </span>
                <span className={h.time === "Closed" ? "text-red-300" : "font-bold text-gold-soft"}>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
          <p className="flex items-center gap-2 text-sm font-black text-ink">
            <MapPin size={16} className="text-teal" />
            Address
          </p>
          <p className="mt-3 text-[13px] leading-7 text-foreground/70">{EN_CLINIC.addressEn}</p>
          <a
            href={SITE.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs font-bold text-teal-3 hover:underline"
          >
            View on the map →
          </a>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/10">
          <p className="flex items-center gap-2 text-sm font-black text-ink">
            <Phone size={16} className="text-teal" />
            Prefer to talk first?
          </p>
          <p className="mt-3 text-[13px] leading-7 text-foreground/70">
            Message us on WhatsApp — send your X-rays and photos for a review before you
            travel.
          </p>
          <a
            href={EN_CLINIC.whatsappText}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-sm font-black text-teal-3"
          >
            <MessageCircle size={15} />
            Chat on WhatsApp
          </a>
        </div>

        <div className="rounded-2xl bg-gold-soft/10 p-5 ring-1 ring-gold-soft/30">
          <p className="text-xs leading-6 text-foreground/70">
            Visiting from abroad? See the step-by-step guide on the{" "}
            <a href="/en/jaw-surgery-in-iran" className="font-bold text-teal-3 underline decoration-teal/40 underline-offset-2">
              Jaw Surgery in Iran
            </a>{" "}
            page — records to send, timeline, costs and follow-up.
          </p>
        </div>
      </aside>
    </div>
  );
}
