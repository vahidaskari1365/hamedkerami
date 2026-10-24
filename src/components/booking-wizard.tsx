"use client";

/* ============================================================
   ویزار رزرو نوبت — مطابق طرح مرجع، ۷ مرحله با موشن‌گرافی
   خوش‌آمد ← ۲)تقویم ← ۳)ساعت ← ۴)پرداخت ← ۵)اطلاعات ← ۶)بررسی ←
   ۷)تأیید موبایل (کد ۵ رقمی پیامکی، تأیید خودکار) ← موفقیت
   RTL کامل، ارقام فارسی، aria و prefers-reduced-motion (SXO)
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Banknote,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Copy,
  CreditCard,
  Download,
  FileText,
  Home,
  Info,
  Loader2,
  MapPin,
  Moon,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Sun,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { SITE, faToEnDigits } from "@/lib/data";
import {
  JALALI_MONTHS,
  gregorianToJalali,
  jalaliMonthLength,
  jalaliToGregorian,
  localIsoDay,
  tehranToday,
} from "@/lib/jalali";
import {
  MAX_AHEAD_DAYS,
  SLOTS,
  SLOT_GROUPS,
  faNumber,
  feeShort,
  type DaySchedule,
} from "@/lib/booking/shared";

/* ---------- ثابت‌های محلی ---------- */

const DOW_LABELS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
const GRID_HEADS = [
  { label: "شنبه", dow: 6 },
  { label: "یکشنبه", dow: 0 },
  { label: "دوشنبه", dow: 1 },
  { label: "سه‌شنبه", dow: 2 },
  { label: "چهارشنبه", dow: 3 },
  { label: "پنجشنبه", dow: 4 },
  { label: "جمعه", dow: 5 },
];
const CLOSED_DOW = [4, 5];

const DRAFT_KEY = "km-booking-draft";
const DRAFT_TTL = 12 * 60 * 60 * 1000;

type Step =
  | "welcome"
  | "date"
  | "time"
  | "payment"
  | "info"
  | "review"
  | "verify"
  | "success";

const FLOW: Step[] = ["date", "time", "payment", "info", "review", "verify"];

const STEP_META: Record<
  Exclude<Step, "welcome" | "success">,
  { label: string; title: string; desc: string }
> = {
  date: {
    label: "تقویم",
    title: "تاریخ مراجعه خود را انتخاب کنید",
    desc: "روزهای پذیرش مطب از تقویم شمسی — تعرفه زیر روزهای آزاد درج شده است",
  },
  time: {
    label: "ساعت",
    title: "ساعت مراجعه را انتخاب کنید",
    desc: "بازه‌های آزاد روز انتخابی به‌همراه پزشک حاضر در آن روز",
  },
  payment: {
    label: "پرداخت",
    title: "فاکتور نوبت را بررسی کنید",
    desc: "تعرفه ویزیت و روش پرداخت را مشخص کنید",
  },
  info: {
    label: "اطلاعات",
    title: "اطلاعات رزرو را ثبت کنید",
    desc: "مشخصات بیمار برای پرونده مطب",
  },
  review: {
    label: "بررسی",
    title: "اطلاعات رزرو را بررسی کنید",
    desc: "از درستی اطلاعات اطمینان پیدا کنید؛ هر ردیف را می‌توانید ویرایش کنید",
  },
  verify: {
    label: "تأیید",
    title: "تأیید شماره موبایل",
    desc: "برای قطعی‌شدن نوبت، کد ۵ رقمی پیامک‌شده را وارد کنید",
  },
};

/* ---------- تایپ‌ها ---------- */

interface ScheduleRes {
  ok: boolean;
  days: DaySchedule[];
  feeToman: number;
  capacity: number;
  onlinePayment: boolean;
  error?: string;
}

interface OtpRes {
  ok: boolean;
  error?: string;
  expiresIn?: number;
  resendIn?: number;
  devCode?: string;
  smsConnected?: boolean;
}

interface VerifyRes {
  ok: boolean;
  error?: string;
  trackingCode?: string;
  dayJalali?: string;
  doctor?: string;
  slotLabel?: string;
  feeToman?: number;
  paymentMethod?: string;
  address?: string;
  smsConnected?: boolean;
}

interface SuccessData {
  trackingCode: string;
  dayJalali: string;
  doctor: string;
  slotLabel: string;
  feeToman: number;
  paymentMethod: string;
  address: string;
  smsConnected: boolean;
}

interface Draft {
  name: string;
  latinName: string;
  gender: string;
  birthYear: string;
  note: string;
  phone: string;
  dayIso: string;
  dayJalali: string;
  slotId: string;
  ts: number;
}

/* ---------- ابزارهای نمایش ---------- */

const faDay = (n: number) => n.toLocaleString("fa-IR", { useGrouping: false });

/** «۰۹۱۲ ۳۴۵ ۶۷۸۹» — نمایش موبایل با ارقام فارسی */
function faMobile(s: string): string {
  const d = faToEnDigits(s).replace(/\D/g, "");
  const grouped = d.length === 11 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : d;
  return grouped.replace(/\d/g, (x) => "۰۱۲۳۴۵۶۷۸۹"[Number(x)]);
}

function normalizePhone(raw: string): string {
  return faToEnDigits(raw).replace(/[\s()._\-]/g, "");
}

/* رویداد GA4 — تبدیل‌های رزرو (SXO) */
function gaEvent(name: string, params?: Record<string, unknown>) {
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  gtag?.("event", name, params);
}

/* ساخت فایل تقویم (.ics) برای «افزودن به تقویم» */
function icsFor(dayIso: string, slotId: string, address: string): string {
  const [y, m, d] = dayIso.split("-").map(Number);
  const [hh, mi] = slotId.split(":").map(Number);
  const p = (n: number) => String(n).padStart(2, "0");
  const endMin = hh * 60 + mi + 45;
  const start = `${y}${p(m)}${p(d)}T${p(hh)}${p(mi)}00`;
  const end = `${y}${p(m)}${p(d)}T${p(Math.floor(endMin / 60))}${p(endMin % 60)}00`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//dr-kermani//booking//FA",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@dr-kermani.com`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "SUMMARY:نوبت مطب دکتر حامد کرمانی",
    `LOCATION:${address.replace(/,/g, "\\,")}`,
    "DESCRIPTION:لطفا ده دقیقه پیش از ساعت نوبت در مطب حاضر باشید.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/* آیا ناوبری به ماه بعد مجاز است؟ */
function monthLimitReached(view: { jy: number; jm: number }, today: Date): boolean {
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

/* واریانت‌های انتقال مرحله — جهت‌دار (RTL) */
const stepVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? -44 : 44, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? 44 : -44, opacity: 0 }),
};

/* ============================================================
   استپر — ۶ گام با خط پیشرفت متحرک و پرش به مراحل قبلی
   ============================================================ */
function Stepper({
  current,
  onJump,
}: {
  current: Step;
  onJump: (s: Step) => void;
}) {
  const idx = FLOW.indexOf(current);
  return (
    <ol dir="rtl" className="flex w-full items-start" aria-label="مراحل رزرو نوبت">
      {FLOW.map((s, i) => {
        const meta = STEP_META[s];
        const state = i < idx ? "done" : i === idx ? "active" : "todo";
        return (
          <li key={s} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              {/* خط اتصال سمت راست */}
              <span
                className={`h-[2.5px] flex-1 rounded-full transition-colors duration-300 ${
                  i === 0 ? "bg-transparent" : state === "todo" ? "bg-ink/10" : "bg-teal"
                }`}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => {
                  if (i < idx) onJump(s);
                }}
                disabled={i >= idx}
                aria-current={state === "active" ? "step" : undefined}
                aria-label={`مرحله ${faDay(i + 1)} — ${meta.label}`}
                className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition-colors ${
                  state === "done"
                    ? "bg-teal text-white"
                    : state === "active"
                      ? "bg-ink text-gold-soft ring-2 ring-teal ring-offset-2 ring-offset-white"
                      : "bg-bone-2 text-foreground/40"
                }`}
              >
                {state === "done" ? <Check size={13} strokeWidth={3} /> : faDay(i + 1)}
              </button>
              {/* خط اتصال سمت چپ */}
              <span
                className={`h-[2.5px] flex-1 rounded-full transition-colors duration-300 ${
                  i === FLOW.length - 1
                    ? "bg-transparent"
                    : FLOW.indexOf(current) > i
                      ? "bg-teal"
                      : "bg-ink/10"
                }`}
                aria-hidden
              />
            </div>
            <span
              className={`text-[10px] font-bold ${
                state === "active"
                  ? "text-ink"
                  : state === "done"
                    ? "text-teal-3"
                    : "text-foreground/35"
              }`}
            >
              {meta.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* کانفتی طلایی لحظه موفقیت — فقط با motion مجاز */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: 6 + ((i * 37) % 88),
        delay: (i % 7) * 0.08,
        size: i % 3 === 0 ? 5 : 3.5,
        color: i % 2 === 0 ? "#c9a13b" : "#e9cf87",
        drift: ((i * 13) % 22) - 11,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-x-0 top-6 mx-auto h-40 w-full" aria-hidden>
      {pieces.map((c, i) => (
        <motion.span
          key={i}
          className="absolute top-0 rounded-[2px]"
          style={{ left: `${c.left}%`, width: c.size, height: c.size * 1.6, background: c.color }}
          initial={{ y: -10, opacity: 0, rotate: 0 }}
          animate={{ y: 130, opacity: [0, 1, 1, 0], rotate: 260, x: c.drift }}
          transition={{ duration: 1.5, delay: c.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   کامپوننت اصلی ویزار
   ============================================================ */
export function BookingWizard() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [direction, setDirection] = useState(1);
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState<{ jy: number; jm: number }>({ jy: 0, jm: 0 });
  const [schedule, setSchedule] = useState<ScheduleRes | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  /* انتخاب‌ها */
  const [dayIso, setDayIso] = useState("");
  const [dayJalali, setDayJalali] = useState("");
  const [slotId, setSlotId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"clinic" | "online">("clinic");

  /* فرم بیمار */
  const [name, setName] = useState("");
  const [latinName, setLatinName] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "">("");
  const [birthYear, setBirthYear] = useState("");
  const [note, setNote] = useState("");

  /* تأیید موبایل */
  const [phone, setPhone] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDevCode, setOtpDevCode] = useState("");
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [resendLeft, setResendLeft] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const verifyingRef = useRef(false);

  /* خطاها و نتیجه */
  const [error, setError] = useState("");
  const [done, setDone] = useState<SuccessData | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  /* ---------- بارگذاری برنامه نوبت‌دهی ---------- */
  const loadSchedule = useCallback(async (withSpinner = true) => {
    if (withSpinner) setScheduleLoading(true);
    try {
      const res = await fetch("/api/appointment/schedule?days=75", { cache: "no-store" });
      const data = (await res.json()) as ScheduleRes;
      if (data.ok) setSchedule(data);
    } catch {
      /* تلاش مجدد با تعامل بعدی کاربر */
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  /* ---------- راه‌اندازی اولیه (بدون setState همگام در effect) ---------- */
  useEffect(() => {
    queueMicrotask(() => {
      const t = tehranToday();
      const [jy, jm] = gregorianToJalali(t.getFullYear(), t.getMonth() + 1, t.getDate());
      setToday(t);
      setView({ jy, jm });
      /* بازیابی پیش‌نویس فرم از refreshهای اخیر */
      try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (raw) {
          const d = JSON.parse(raw) as Draft;
          if (Date.now() - d.ts < DRAFT_TTL) {
            setName(d.name ?? "");
            setLatinName(d.latinName ?? "");
            setGender(d.gender === "female" || d.gender === "male" ? d.gender : "");
            setBirthYear(d.birthYear ?? "");
            setNote(d.note ?? "");
            setPhone(d.phone ?? "");
            setDayIso(d.dayIso ?? "");
            setDayJalali(d.dayJalali ?? "");
            setSlotId(d.slotId ?? "");
          }
        }
      } catch {
        /* پیش‌نویس خراب — نادیده */
      }
      void loadSchedule(false);
      setMounted(true);
    });
  }, [loadSchedule]);

  /* ---------- ذخیره پیش‌نویس ---------- */
  useEffect(() => {
    if (!mounted) return;
    try {
      const draft: Draft = {
        name,
        latinName,
        gender,
        birthYear,
        note,
        phone,
        dayIso,
        dayJalali,
        slotId,
        ts: Date.now(),
      };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* حافظه در دسترس نیست */
    }
  }, [mounted, name, latinName, gender, birthYear, note, phone, dayIso, dayJalali, slotId]);

  /* ---------- روز انتخابی از برنامه ---------- */
  const selDay: DaySchedule | undefined = useMemo(
    () => schedule?.days.find((d) => d.iso === dayIso),
    [schedule, dayIso],
  );
  const feeToman = schedule?.feeToman ?? 0;
  const slotLabel = SLOTS.find((s) => s.id === slotId)?.label ?? "";
  const dayDoctor = selDay?.doctor ?? "";

  /* اگر روز ذخیره‌شده دیگر معتبر نیست (گذشته/تعطیل/پر) پاک می‌شود */
  useEffect(() => {
    if (!schedule || !dayIso) return;
    queueMicrotask(() => {
      const d = schedule.days.find((x) => x.iso === dayIso);
      if (!d || d.past || d.tooFar || !d.open || d.slots.every((s) => s.remaining <= 0)) {
        setDayIso("");
        setDayJalali("");
        setSlotId("");
      }
    });
  }, [schedule, dayIso]);

  /* ---------- پیمایش مراحل ---------- */
  const go = useCallback((next: Step, dir: number) => {
    setDirection(dir);
    setStep(next);
    setError("");
    if (next === "date") void loadSchedule(true);
  }, [loadSchedule]);

  /* فوکوس روی عنوان مرحله — دسترس‌پذیری */
  useEffect(() => {
    if (step === "welcome" || step === "success") return;
    const t = setTimeout(() => titleRef.current?.focus({ preventScroll: true }), 120);
    return () => clearTimeout(t);
  }, [step]);

  const showChrome = step !== "welcome" && step !== "success";
  const stepIdx = FLOW.indexOf(step);

  /* ---------- تقویم ماه جاری ---------- */
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
      const iso = localIsoDay(date);
      const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
      const closed = CLOSED_DOW.includes(dow);
      const past = diff < 0;
      const tooFar = diff > MAX_AHEAD_DAYS;
      const sch = schedule?.days.find((x) => x.iso === iso);
      const open = sch ? sch.open && sch.slots.some((s) => s.remaining > 0) : false;
      return {
        d,
        iso,
        dow,
        disabled: closed || past || tooFar || (mounted && schedule ? !open : false),
        isToday: iso === localIsoDay(today),
        closed,
        hasPrice: open && !past && !tooFar,
      };
    });
    return { lead, days, first };
  }, [today, view, schedule, mounted]);

  const isCurrentMonth =
    today !== null && view.jy === gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate())[0] &&
    view.jm === gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate())[1];
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
    /* جلوخوردن نرم به مرحله ساعت — مطابق جریان اپ‌مانند طرح */
    setTimeout(() => go("time", 1), 420);
  }

  function pickSlot(id: string) {
    setSlotId(id);
    setTimeout(() => go("payment", 1), 420);
  }

  /* ---------- اعتبارسنجی مرحله اطلاعات ---------- */
  function validateInfo(): boolean {
    if (name.trim().length < 2) {
      setError("نام و نام خانوادگی را کامل وارد کنید");
      return false;
    }
    if (latinName.trim() && !/^[A-Za-z\s.'-]+$/.test(latinName.trim())) {
      setError("نام لاتین فقط با حروف انگلیسی نوشته می‌شود");
      return false;
    }
    if (birthYear.trim()) {
      const y = Number(faToEnDigits(birthYear));
      if (!Number.isFinite(y) || y < 1300 || y > 1410) {
        setError("سال تولد معتبر نیست — مثل ۱۳۸۵");
        return false;
      }
    }
    return true;
  }

  /* ---------- ارسال کد OTP ---------- */
  const requestOtp = useCallback(
    async (force = false) => {
      const digits = normalizePhone(phone);
      if (!/^09\d{9}$/.test(digits)) {
        setOtpError("شماره موبایل معتبر وارد کنید — مثل ۰۹۱۲۳۴۵۶۷۸۹");
        return;
      }
      setOtpBusy(true);
      setOtpError("");
      try {
        const res = await fetch("/api/appointment/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: digits }),
        });
        const data = (await res.json()) as OtpRes;
        if (data.ok) {
          setOtpSent(true);
          setOtpDevCode(data.devCode ?? "");
          setOtpExpiresIn(data.expiresIn ?? 180);
          setResendLeft(data.resendIn ?? 60);
          setOtpCode("");
          setVerifyError("");
        } else {
          if (data.resendIn && data.resendIn > 0) setResendLeft(data.resendIn);
          setOtpError(data.error || "ارسال کد انجام نشد — دوباره تلاش کنید");
          if (force) setOtpSent(false);
        }
      } catch {
        setOtpError("خطای ارتباط با سرور — دوباره تلاش کنید");
      } finally {
        setOtpBusy(false);
      }
    },
    [phone],
  );

  /* شمارنده‌های اعتبار و ارسال مجدد */
  useEffect(() => {
    if (!otpSent) return;
    const iv = setInterval(() => {
      setOtpExpiresIn((s) => Math.max(0, s - 1));
      setResendLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(iv);
  }, [otpSent]);

  /* ---------- تأیید کد و ثبت قطعی (تأیید خودکار با رقم پنجم)
     انقضا را سرور تعیین می‌کند؛ چک سمت کلاینت حذف شد تا شناسه
     submitVerify با تیک‌شمار ثانیه‌ای تغییر نکند */
  const submitVerify = useCallback(
    async (code: string) => {
      if (verifyingRef.current) return;
      verifyingRef.current = true;
      setVerifying(true);
      setVerifyError("");
      try {
        const res = await fetch("/api/appointment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: normalizePhone(phone),
            code,
            name: name.trim(),
            latinName: latinName.trim(),
            gender,
            birthYear: faToEnDigits(birthYear).trim(),
            dayIso,
            slot: slotId,
            paymentMethod,
            note: note.trim(),
          }),
        });
        const data = (await res.json()) as VerifyRes;
        if (data.ok && data.trackingCode) {
          gaEvent("appointment_confirmed", { doctor: data.doctor });
          setDone({
            trackingCode: data.trackingCode,
            dayJalali: data.dayJalali ?? dayJalali,
            doctor: data.doctor ?? dayDoctor,
            slotLabel: data.slotLabel ?? slotLabel,
            feeToman: data.feeToman ?? feeToman,
            paymentMethod: data.paymentMethod ?? paymentMethod,
            address: data.address ?? SITE.address,
            smsConnected: Boolean(data.smsConnected),
          });
          setStep("success");
          setDirection(1);
          try {
            sessionStorage.removeItem(DRAFT_KEY);
          } catch {
            /* بی‌اهمیت */
          }
        } else {
          setVerifyError(data.error || "تأیید انجام نشد — کد را بررسی کنید");
          setOtpCode("");
        }
      } catch {
        setVerifyError("خطای ارتباط با سرور — دوباره تلاش کنید");
        setOtpCode("");
      } finally {
        verifyingRef.current = false;
        setVerifying(false);
      }
    },
    [phone, name, latinName, gender, birthYear, dayIso, slotId, paymentMethod, note, dayJalali, dayDoctor, slotLabel, feeToman],
  );

  /* نگه‌داشتِ آخرین نسخه submitVerify در ref — تایمر تأیید خودکار
     بدون وابستگی به شناسه‌های متغیر (شمارنده‌های ثانیه) کار می‌کند */
  const submitVerifyRef = useRef<(code: string) => Promise<void>>(async () => {});
  useEffect(() => {
    submitVerifyRef.current = submitVerify;
  }, [submitVerify]);

  /* تأیید خودکار به محض ورود رقم پنجم (طبق طرح کاربر) */
  useEffect(() => {
    if (otpSent && otpCode.length === 5 && !verifyingRef.current) {
      const t = setTimeout(() => void submitVerifyRef.current(otpCode), 80);
      return () => clearTimeout(t);
    }
  }, [otpCode, otpSent]);

  /* ---------- صفحه موفقیت ---------- */
  if (step === "success" && done) {
    return (
      <SuccessScreen
        done={done}
        dayIso={dayIso}
        slotId={slotId}
        reduce={Boolean(reduce)}
        onReset={() => {
      setDone(null);
      setStep("welcome");
      setDayIso("");
      setDayJalali("");
      setSlotId("");
      setName("");
      setLatinName("");
      setGender("");
      setBirthYear("");
      setNote("");
      setPhone("");
      setOtpSent(false);
      setOtpCode("");
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-ink/10">
        {/* ---------- هدر ویزار: بازگشت + استپر ---------- */}
        {showChrome ? (
          <div className="border-b border-ink/8 px-4 pb-4 pt-4 sm:px-7">
            <div className="mx-auto flex max-w-xl items-start gap-3">
              {stepIdx > 0 ? (
                <button
                  type="button"
                  onClick={() => go(FLOW[stepIdx - 1], -1)}
                  aria-label="مرحله قبل"
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bone text-foreground/60 transition hover:bg-teal/10 hover:text-teal"
                >
                  <ChevronRight size={16} aria-hidden />
                </button>
              ) : null}
              <div className="min-w-0 flex-1">
                <Stepper current={step} onJump={(s) => go(s, -1)} />
              </div>
              {stepIdx > 0 ? <span className="w-8 shrink-0" aria-hidden /> : null}
            </div>
          </div>
        ) : null}

        <div className="p-4 sm:p-7">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={
                reduce
                  ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
                  : stepVariants
              }
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.15 : 0.28, ease: "easeOut" }}
            >
              {/* ============ مرحله ۱ — خوش‌آمد ============ */}
              {step === "welcome" ? (
                <div className="py-2 text-center sm:py-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative mx-auto w-52 sm:w-64"
                  >
                    <motion.div
                      animate={reduce ? undefined : { y: [0, -9, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Image
                        src="/images/booking/welcome-doctor.png"
                        alt="تصویر سه‌بعدی پزشک در حال خوش‌آمدگویی پشت در مطب"
                        width={512}
                        height={512}
                        priority
                        sizes="(max-width: 640px) 208px, 256px"
                        className="w-full rounded-[2.2rem]"
                      />
                    </motion.div>
                    {!reduce ? (
                      <>
                        <motion.span
                          aria-hidden
                          className="absolute -right-2 top-10 h-3 w-3 rounded-full bg-gold-soft/90"
                          animate={{ y: [0, -12, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.span
                          aria-hidden
                          className="absolute bottom-14 left-1 h-2 w-2 rounded-full bg-teal/70"
                          animate={{ y: [0, 9, 0] }}
                          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </>
                    ) : null}
                  </motion.div>

                  <h2 className="mt-6 text-2xl font-black text-ink sm:text-[1.75rem]">
                    سلام! خوش آمدید
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-foreground/65">
                    رزرو نوبت مطب دکتر حامد کرمانی آنلاین است؛ روز و ساعت مراجعه را انتخاب کنید و در
                    پایان با کد پیامکی، نوبت خود را قطعی کنید.
                  </p>

                  <ul
                    className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-2"
                    aria-label="مزایای رزرو آنلاین"
                  >
                    {[
                      { icon: CalendarDays, t: "تقویم شمسی" },
                      { icon: ShieldCheck, t: "تأیید پیامکی" },
                      { icon: Clock, t: "کمتر از ۱ دقیقه" },
                    ].map((f) => (
                      <li
                        key={f.t}
                        className="flex flex-col items-center gap-1.5 rounded-2xl bg-bone/70 px-2 py-3 ring-1 ring-ink/8"
                      >
                        <f.icon size={17} className="text-teal-3" aria-hidden />
                        <span className="text-[10.5px] font-bold text-foreground/70">{f.t}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    onClick={() => {
                      gaEvent("appointment_start");
                      go("date", 1);
                    }}
                    className="mt-6 w-full max-w-xs gap-2 text-base"
                  >
                    <CalendarCheck size={18} aria-hidden />
                    شروع رزرو نوبت
                  </Button>
                  <p className="mt-3 text-[11px] text-foreground/45">
                    شنبه تا چهارشنبه، ۱۵ تا ۱۹ — بلوار کشاورز، تقاطع جمالزاده
                  </p>
                </div>
              ) : null}

              {/* ============ مرحله ۲ — تقویم شمسی ============ */}
              {step === "date" ? (
                <section aria-labelledby="bw-date-title">
                  <h2
                    id="bw-date-title"
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-base font-black text-ink outline-none"
                  >
                    {STEP_META.date.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-foreground/55">{STEP_META.date.desc}</p>

                  <div className="mt-4 rounded-2xl bg-bone/60 p-4 ring-1 ring-ink/8">
                    {/* ناوبری ماه */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => shiftMonth(-1)}
                        disabled={isCurrentMonth}
                        aria-label="ماه قبل"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground/70 ring-1 ring-ink/8 transition hover:text-teal disabled:opacity-30"
                      >
                        <ChevronRight size={17} aria-hidden />
                      </button>
                      <p className="text-sm font-black text-ink">
                        {view.jy ? `${JALALI_MONTHS[view.jm - 1]} ${faDay(view.jy)}` : "…"}
                      </p>
                      <button
                        type="button"
                        onClick={() => shiftMonth(1)}
                        disabled={!today || !view.jy || monthLimitReached(view, today)}
                        aria-label="ماه بعد"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground/70 ring-1 ring-ink/8 transition hover:text-teal disabled:opacity-30"
                      >
                        <ChevronLeft size={17} aria-hidden />
                      </button>
                    </div>

                    {/* سرستون روزها */}
                    <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                      {GRID_HEADS.map((h) => (
                        <span
                          key={h.label}
                          className="py-1 text-[10px] font-black text-foreground/45"
                        >
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
                              aria-label={`${DOW_LABELS[cell.dow]} ${faDay(cell.d)} ${
                                JALALI_MONTHS[view.jm - 1]
                              }`}
                              aria-pressed={selected}
                              title={
                                cell.closed
                                  ? "مطب تعطیل است"
                                  : cell.disabled
                                    ? "ظرفیت تکمیل است یا روز فعال نیست"
                                    : undefined
                              }
                              className={`relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[13px] font-bold transition sm:h-[4.25rem] ${
                                selected
                                  ? "text-white"
                                  : cell.disabled
                                    ? `cursor-not-allowed ${
                                        cell.closed ? "text-red-300" : "text-foreground/20"
                                      }`
                                    : "bg-white text-foreground/80 ring-1 ring-ink/8 hover:ring-teal/50"
                              }`}
                            >
                              {selected ? (
                                <motion.span
                                  layoutId="bw-daybg"
                                  className="absolute inset-0 rounded-xl bg-teal shadow-md shadow-teal/25"
                                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                                />
                              ) : null}
                              <span className="relative">{faDay(cell.d)}</span>
                              <span
                                className={`relative text-[8.5px] font-bold ${
                                  selected ? "text-white/85" : "text-teal-3/75"
                                }`}
                              >
                                {cell.hasPrice && feeToman > 0 ? feeShort(feeToman) : "\u00a0"}
                              </span>
                              {cell.isToday && !selected ? (
                                <span
                                  className="absolute inset-x-5 bottom-1 h-[2.5px] rounded-full bg-teal/60"
                                  aria-hidden
                                />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-1 grid h-56 animate-pulse grid-cols-7 gap-1" aria-hidden>
                        {Array.from({ length: 35 }).map((_, i) => (
                          <span key={i} className="rounded-xl bg-bone-2/70" />
                        ))}
                      </div>
                    )}

                    {/* راهنما */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-ink/8 pt-3 text-[10.5px] text-foreground/50">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-md bg-teal" /> روز انتخابی
                      </span>
                      <span>عدد زیر هر روز: تعرفه به هزار تومان</span>
                      <span className="text-red-300">قرمز: تعطیل (پنجشنبه و جمعه)</span>
                      <span>کم‌رنگ: تکمیل ظرفیت یا خارج از بازه</span>
                    </div>
                  </div>

                  {error ? (
                    <p
                      role="alert"
                      className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700"
                    >
                      {error}
                    </p>
                  ) : null}

                  <Button
                    disabled={!dayIso}
                    onClick={() => go("time", 1)}
                    className="mt-5 w-full gap-2"
                  >
                    ادامه
                    <ChevronLeft size={16} aria-hidden />
                  </Button>
                </section>
              ) : null}

              {/* ============ مرحله ۳ — ساعت مراجعه ============ */}
              {step === "time" ? (
                <section aria-labelledby="bw-time-title">
                  <h2
                    id="bw-time-title"
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-base font-black text-ink outline-none"
                  >
                    {STEP_META.time.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-foreground/55">{STEP_META.time.desc}</p>

                  <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl bg-ink px-4 py-3">
                    <span className="flex items-center gap-2 text-xs font-black text-gold-soft">
                      <CalendarDays size={15} aria-hidden />
                      {dayJalali || "…"}
                    </span>
                    {dayDoctor ? (
                      <span className="text-[11px] text-white/65">{dayDoctor}</span>
                    ) : null}
                  </div>

                  {scheduleLoading && !schedule ? (
                    <div className="mt-4 space-y-2.5" aria-hidden>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-2xl bg-bone-2/70" />
                      ))}
                    </div>
                  ) : (
                    (["afternoon", "evening"] as const).map((g) => {
                      const slots = selDay?.slots.filter((s) => s.group === g) ?? [];
                      if (slots.length === 0) return null;
                      const meta = SLOT_GROUPS[g];
                      return (
                        <div key={g} className="mt-5">
                          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-black text-foreground/70">
                            {meta.icon === "sun" ? (
                              <Sun size={14} className="text-teal-2" aria-hidden />
                            ) : (
                              <Moon size={14} className="text-teal-3" aria-hidden />
                            )}
                            {meta.label}
                          </p>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {slots.map((s, i) => {
                              const full = s.remaining <= 0;
                              const active = slotId === s.id;
                              return (
                                <motion.button
                                  key={s.id}
                                  type="button"
                                  disabled={full}
                                  onClick={() => pickSlot(s.id)}
                                  aria-pressed={active}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05, duration: 0.25 }}
                                  className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-right ring-1 transition ${
                                    active
                                      ? "bg-teal/10 ring-2 ring-teal shadow-md shadow-teal/10"
                                      : full
                                        ? "cursor-not-allowed bg-bone/40 ring-ink/6 opacity-55"
                                        : "bg-white ring-ink/10 hover:ring-teal/50"
                                  }`}
                                >
                                  <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                      active
                                        ? "bg-teal text-white"
                                        : "bg-bone text-foreground/60"
                                    }`}
                                  >
                                    <Clock size={15} aria-hidden />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-black text-ink">
                                      {s.label}
                                    </span>
                                    <span className="mt-0.5 block text-[10.5px] font-bold text-teal-3">
                                      {full
                                        ? "ظرفیت تکمیل"
                                        : `${faNumber(s.remaining)} ظرفیت باقی‌مانده`}
                                    </span>
                                  </span>
                                  <span className="shrink-0 text-[10.5px] font-black text-foreground/50">
                                    {faNumber(feeToman)} تومان
                                  </span>
                                  {active ? (
                                    <CheckCircle2
                                      size={17}
                                      className="shrink-0 text-teal"
                                      aria-hidden
                                    />
                                  ) : null}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {error ? (
                    <p
                      role="alert"
                      className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700"
                    >
                      {error}
                    </p>
                  ) : null}

                  <Button
                    disabled={!slotId}
                    onClick={() => go("payment", 1)}
                    className="mt-5 w-full gap-2"
                  >
                    ادامه
                    <ChevronLeft size={16} aria-hidden />
                  </Button>
                </section>
              ) : null}

              {/* ============ مرحله ۴ — پرداخت / فاکتور ============ */}
              {step === "payment" ? (
                <section aria-labelledby="bw-pay-title">
                  <h2
                    id="bw-pay-title"
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-base font-black text-ink outline-none"
                  >
                    {STEP_META.payment.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-foreground/55">
                    {STEP_META.payment.desc}
                  </p>

                  <div className="mt-4 rounded-2xl bg-bone/60 p-5 ring-1 ring-ink/8">
                    <p className="flex items-center gap-2 text-sm font-black text-ink">
                      <ClipboardCheck size={16} className="text-teal-3" aria-hidden />
                      فاکتور نوبت
                    </p>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-foreground/60">ویزیت تخصصی جراحی فک و صورت</dt>
                        <dd className="font-bold text-ink">{faNumber(feeToman)} تومان</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-dashed border-ink/15 pt-3">
                        <dt className="font-black text-ink">قابل پرداخت</dt>
                        <dd className="text-base font-black text-ink">
                          {faNumber(feeToman)} تومان
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <p className="mb-2 mt-5 text-xs font-black text-foreground/70">روش پرداخت</p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("clinic")}
                      aria-pressed={paymentMethod === "clinic"}
                      className={`flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-right ring-1 transition ${
                        paymentMethod === "clinic"
                          ? "bg-teal/10 ring-2 ring-teal shadow-md shadow-teal/10"
                          : "bg-white ring-ink/10 hover:ring-teal/50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          paymentMethod === "clinic"
                            ? "bg-teal text-white"
                            : "bg-bone text-foreground/60"
                        }`}
                      >
                        <Banknote size={16} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-ink">پرداخت در مطب</span>
                        <span className="mt-0.5 block text-[10.5px] text-foreground/50">
                          هنگام مراجعه — نقدی یا کارتخوان
                        </span>
                      </span>
                      {paymentMethod === "clinic" ? (
                        <CheckCircle2 size={17} className="shrink-0 text-teal" aria-hidden />
                      ) : null}
                    </button>

                    <div
                      aria-disabled="true"
                      className="flex items-center gap-2.5 rounded-2xl bg-bone/40 px-4 py-3.5 text-right ring-1 ring-ink/8 opacity-60"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bone text-foreground/40">
                        <CreditCard size={16} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-foreground/60">
                          پرداخت آنلاین
                        </span>
                        <span className="mt-0.5 block text-[10.5px] text-foreground/45">
                          درگاه بانکی به‌زودی فعال می‌شود
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-[9.5px] font-black text-gold-soft">
                        به‌زودی
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2.5 rounded-2xl bg-gold-soft/15 p-4 text-[11px] leading-5 text-foreground/75 ring-1 ring-gold-soft/40">
                    <Info size={16} className="mt-0.5 shrink-0 text-teal-3" aria-hidden />
                    ثبت نوبت بدون پرداخت آنلاین قطعی می‌شود؛ هزینه ویزیت هنگام مراجعه در مطب
                    دریافت می‌شود.
                  </div>

                  {error ? (
                    <p
                      role="alert"
                      className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700"
                    >
                      {error}
                    </p>
                  ) : null}

                  <Button onClick={() => go("info", 1)} className="mt-5 w-full gap-2">
                    ادامه
                    <ChevronLeft size={16} aria-hidden />
                  </Button>
                </section>
              ) : null}

              {/* ============ مرحله ۵ — اطلاعات بیمار ============ */}
              {step === "info" ? (
                <section aria-labelledby="bw-info-title">
                  <h2
                    id="bw-info-title"
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-base font-black text-ink outline-none"
                  >
                    {STEP_META.info.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-foreground/55">{STEP_META.info.desc}</p>

                  {/* خلاصه انتخاب‌های قبل */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-bold text-gold-soft">
                      <CalendarDays size={12} aria-hidden />
                      {dayJalali}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-bold text-gold-soft">
                      <Clock size={12} aria-hidden />
                      {slotLabel}
                    </span>
                    {dayDoctor ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-gold-soft/25 px-3 py-1.5 font-bold text-teal-3 ring-1 ring-gold-soft/50">
                        <UserRound size={12} aria-hidden />
                        {dayDoctor}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="bw-name">نام و نام خانوادگی بیمار *</Label>
                      <Input
                        id="bw-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={120}
                        placeholder="مثلاً سارا محمدی"
                        className="mt-1.5"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bw-gender">جنسیت *</Label>
                      <div className="mt-1.5 grid grid-cols-2 gap-2" role="group" aria-label="جنسیت">
                        {[
                          { v: "female" as const, t: "خانم" },
                          { v: "male" as const, t: "آقا" },
                        ].map((g) => (
                          <button
                            key={g.v}
                            type="button"
                            onClick={() => setGender(gender === g.v ? "" : g.v)}
                            aria-pressed={gender === g.v}
                            className={`flex h-10 items-center justify-center gap-1.5 rounded-md text-sm font-bold ring-1 transition ${
                              gender === g.v
                                ? "bg-teal/10 text-teal-3 ring-2 ring-teal"
                                : "bg-background text-foreground/65 ring-input hover:ring-teal/40"
                            }`}
                          >
                            <UserRound size={14} aria-hidden />
                            {g.t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bw-latin">نام لاتین (اختیاری)</Label>
                      <Input
                        id="bw-latin"
                        value={latinName}
                        onChange={(e) => setLatinName(e.target.value)}
                        maxLength={120}
                        dir="ltr"
                        placeholder="Sara Mohammadi"
                        className="mt-1.5 text-right"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bw-birth">سال تولد (اختیاری)</Label>
                      <Input
                        id="bw-birth"
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        maxLength={4}
                        inputMode="numeric"
                        placeholder="۱۳۸۵"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="bw-note">توضیح برای مطب (اختیاری)</Label>
                      <textarea
                        id="bw-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={1500}
                        rows={3}
                        placeholder="مثلاً عکس رادیوگرافی دارم، یا درخواست مشاوره جراحی فک دارم…"
                        className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      />
                    </div>
                  </div>

                  {error ? (
                    <p
                      role="alert"
                      className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700"
                    >
                      {error}
                    </p>
                  ) : null}

                  <Button
                    onClick={() => {
                      if (validateInfo()) go("review", 1);
                    }}
                    className="mt-5 w-full gap-2"
                  >
                    ادامه
                    <ChevronLeft size={16} aria-hidden />
                  </Button>
                </section>
              ) : null}

              {/* ============ مرحله ۶ — بازبینی اطلاعات ============ */}
              {step === "review" ? (
                <section aria-labelledby="bw-review-title">
                  <h2
                    id="bw-review-title"
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-base font-black text-ink outline-none"
                  >
                    {STEP_META.review.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-foreground/55">
                    {STEP_META.review.desc}
                  </p>

                  <div className="mt-4 divide-y divide-ink/8 overflow-hidden rounded-2xl bg-bone/60 ring-1 ring-ink/8">
                    {(
                      [
                        { icon: UserRound, label: "نام بیمار", value: name, edit: "info" },
                        ...(gender
                          ? [
                              {
                                icon: UserRound,
                                label: "جنسیت",
                                value: gender === "female" ? "خانم" : "آقا",
                                edit: "info" as const,
                              },
                            ]
                          : []),
                        ...(birthYear
                          ? [
                              {
                                icon: CalendarDays,
                                label: "سال تولد",
                                value: faDay(Number(faToEnDigits(birthYear))),
                                edit: "info" as const,
                              },
                            ]
                          : []),
                        ...(latinName
                          ? [
                              {
                                icon: FileText,
                                label: "نام لاتین",
                                value: latinName,
                                edit: "info" as const,
                              },
                            ]
                          : []),
                        ...(dayDoctor
                          ? [
                              {
                                icon: Stethoscope,
                                label: "پزشک",
                                value: dayDoctor,
                                edit: null,
                              },
                            ]
                          : []),
                        {
                          icon: CalendarDays,
                          label: "روز مراجعه",
                          value: dayJalali,
                          edit: "date" as const,
                        },
                        {
                          icon: Clock,
                          label: "ساعت مراجعه",
                          value: slotLabel,
                          edit: "time" as const,
                        },
                        {
                          icon: MapPin,
                          label: "نوع ویزیت",
                          value: "حضوری — مطب",
                          edit: null,
                        },
                        {
                          icon: Banknote,
                          label: "هزینه و پرداخت",
                          value: `${faNumber(feeToman)} تومان — پرداخت در مطب`,
                          edit: "payment" as const,
                        },
                      ] as { icon: typeof UserRound; label: string; value: string; edit: Step | null }[]
                    ).map((r, i) => (
                      <motion.div
                        key={r.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.045, duration: 0.25 }}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                      >
                        <span className="flex shrink-0 items-center gap-2 text-[11px] text-foreground/55">
                          <r.icon size={13} aria-hidden />
                          {r.label}
                        </span>
                        <span className="flex min-w-0 items-center gap-2 text-left">
                          <span className="truncate font-bold text-ink">{r.value}</span>
                          {r.edit ? (
                            <button
                              type="button"
                              onClick={() => go(r.edit as Step, -1)}
                              className="shrink-0 text-[10px] font-black text-teal-3 hover:underline"
                            >
                              ویرایش
                            </button>
                          ) : null}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2.5 rounded-2xl bg-gold-soft/15 p-4 text-[11px] leading-5 text-foreground/75 ring-1 ring-gold-soft/40">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-teal-3" aria-hidden />
                    پس از تأیید، کد ۵ رقمی به موبایل شما پیامک می‌شود؛ با واردکردن آن، نوبت به‌صورت
                    خودکار قطعی می‌شود.
                  </div>

                  <Button
                    onClick={() => go("verify", 1)}
                    className="mt-5 w-full gap-2 text-base"
                    size="lg"
                  >
                    <ShieldCheck size={17} aria-hidden />
                    تأیید و ادامه — ثبت نهایی نوبت
                  </Button>
                </section>
              ) : null}

              {/* ============ مرحله ۷ — تأیید موبایل با کد پیامکی ============ */}
              {step === "verify" ? (
                <section aria-labelledby="bw-verify-title">
                  <h2
                    id="bw-verify-title"
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-base font-black text-ink outline-none"
                  >
                    {STEP_META.verify.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-foreground/55">
                    {STEP_META.verify.desc}
                  </p>

                  {/* باکس ۱ — ورود شماره موبایل */}
                  <div className="mt-4 rounded-2xl bg-bone/60 p-5 ring-1 ring-ink/8">
                    <Label
                      htmlFor="bw-phone"
                      className="flex items-center gap-2 text-sm font-black text-ink"
                    >
                      <Smartphone size={15} className="text-teal-3" aria-hidden />
                      شماره موبایل خود را وارد کنید
                    </Label>
                    <Input
                      id="bw-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      inputMode="tel"
                      dir="ltr"
                      maxLength={13}
                      placeholder="09123456789"
                      className="mt-2 text-right"
                      autoComplete="tel"
                    />
                    <Button
                      onClick={() => void requestOtp()}
                      disabled={otpBusy || otpSent}
                      className="mt-3 w-full gap-2"
                    >
                      {otpBusy ? (
                        <Loader2 size={16} className="animate-spin" aria-hidden />
                      ) : (
                        <ShieldCheck size={16} aria-hidden />
                      )}
                      {otpSent ? "کد ارسال شد" : "تأیید و ارسال کد"}
                    </Button>
                    {otpError ? (
                      <p
                        role="alert"
                        className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700"
                      >
                        {otpError}
                      </p>
                    ) : null}
                  </div>

                  {/* باکس ۲ — کد ۵ رقمی (بعد از ارسال، با انیمیشن باز می‌شود) */}
                  <AnimatePresence initial={false}>
                    {otpSent ? (
                      <motion.div
                        key="otp-box"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0.15 : 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 rounded-2xl bg-ink p-5 ring-1 ring-ink">
                          <p className="flex items-center gap-2 text-sm font-black text-gold-soft">
                            <ShieldCheck size={15} aria-hidden />
                            کد ۵ رقمی پیامک‌شده را وارد کنید
                          </p>
                          <p className="mt-1.5 text-[11px] text-white/55">
                            {otpExpiresIn > 0 ? (
                              <>
                                ارسال‌شده به {faMobile(phone)} — اعتبار کد:{" "}
                                {faDay(Math.floor(otpExpiresIn / 60))}:
                                {String(otpExpiresIn % 60).padStart(2, "0").replace(/\d/g, (x) => "۰۱۲۳۴۵۶۷۸۹"[Number(x)])}
                              </>
                            ) : (
                              <>کد منقضی شده است — دکمه «ارسال مجدد کد» را بزنید</>
                            )}
                          </p>

                          {otpDevCode ? (
                            <p className="mt-3 rounded-xl bg-gold-soft/12 px-3 py-2.5 text-[11px] leading-5 text-gold-soft ring-1 ring-gold-soft/30">
                              حالت تست — پنل پیامک هنوز متصل نیست؛ کد شما:{" "}
                              <b dir="ltr" className="tracking-[0.3em]">
                                {otpDevCode}
                              </b>
                            </p>
                          ) : null}

                          <div dir="ltr" className="mt-4 flex justify-center">
                            <InputOTP
                              maxLength={5}
                              value={otpCode}
                              onChange={setOtpCode}
                              disabled={verifying}
                              aria-label="کد ۵ رقمی تأیید"
                            >
                              <InputOTPGroup className="gap-2">
                                {[0, 1, 2, 3, 4].map((i) => (
                                  <InputOTPSlot
                                    key={i}
                                    index={i}
                                    className="h-12 w-11 rounded-xl border-white/15 bg-white/5 text-lg font-black text-white shadow-none"
                                  />
                                ))}
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                          {verifying ? (
                            <p className="mt-3 flex items-center justify-center gap-2 text-[11px] font-bold text-white/60">
                              <Loader2 size={13} className="animate-spin" aria-hidden />
                              در حال بررسی و ثبت نوبت…
                            </p>
                          ) : null}
                          {verifyError ? (
                            <p
                              role="alert"
                              className="mt-3 rounded-xl bg-red-500/10 px-3 py-2.5 text-xs font-bold text-red-300"
                            >
                              {verifyError}
                            </p>
                          ) : null}

                          <div className="mt-4 flex items-center justify-between text-[11px]">
                            <button
                              type="button"
                              onClick={() => {
                                setOtpSent(false);
                                setOtpCode("");
                                setVerifyError("");
                                setOtpDevCode("");
                              }}
                              className="text-white/50 transition hover:text-white"
                            >
                              تغییر شماره
                            </button>
                            <button
                              type="button"
                              onClick={() => void requestOtp(true)}
                              disabled={resendLeft > 0 || otpBusy}
                              className="flex items-center gap-1 font-black text-gold-soft transition hover:text-white disabled:opacity-40"
                            >
                              <RefreshCcw size={12} aria-hidden />
                              {resendLeft > 0
                                ? `ارسال مجدد تا ${faDay(resendLeft)} ثانیه`
                                : "ارسال مجدد کد"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <p className="mt-4 text-center text-[11px] leading-5 text-foreground/45">
                    شماره شما فقط برای هماهنگی همین نوبت استفاده می‌شود؛ بدون کد پیامکی، نوبت ثبت
                    نمی‌شود.
                  </p>
                </section>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] leading-5 text-foreground/45">
        نوبت پس از تأیید کد پیامکی قطعی می‌شود — اطلاعات شما فقط برای همین رزرو استفاده می‌شود.
      </p>
    </div>
  );
}

/* ============================================================
   صفحه موفقیت — کد رهگیری + خلاصه نوبت + افزودن به تقویم
   ============================================================ */
function SuccessScreen({
  done,
  dayIso,
  slotId,
  reduce,
  onReset,
}: {
  done: SuccessData;
  dayIso: string;
  slotId: string;
  reduce: boolean;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard
      ?.writeText(done.trackingCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  }

  function downloadIcs() {
    if (!dayIso || !slotId) return;
    const blob = new Blob([icsFor(dayIso, slotId, done.address)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nobat-dr-kermani.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative py-3 text-center"
    >
      {!reduce ? <Confetti /> : null}

      {/* تیک طلایی متحرک */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal/12 ring-2 ring-teal/45"
      >
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" aria-hidden>
          <motion.path
            d="M4 12.5l5 5L20 6.5"
            stroke="#c9a13b"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, delay: 0.35, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <h2 tabIndex={-1} className="mt-4 text-xl font-black text-ink outline-none sm:text-2xl">
        نوبت شما قطعی شد
      </h2>
      <p className="mt-2 text-sm leading-6 text-foreground/60">
        کد رهگیری نوبت — برای پیگیری یا تغییر، این کد را نزد خود نگه دارید
      </p>

      <div className="mx-auto mt-4 flex w-fit items-center gap-2.5 rounded-2xl bg-ink px-5 py-3 shadow-lg">
        <span dir="ltr" className="text-lg font-black tracking-[0.18em] text-gold-soft">
          {done.trackingCode}
        </span>
        <button
          type="button"
          onClick={copyCode}
          aria-label="کپی کد رهگیری"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gold-soft transition hover:bg-white/20"
        >
          {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <Image
          src="/images/booking/success-doctor.png"
          alt="تصویر سه‌بعدی پزشک در حال تبریک ثبت نوبت"
          width={360}
          height={360}
          className="mx-auto mt-5 w-40 rounded-3xl sm:w-48"
        />
      </motion.div>

      <dl className="mx-auto mt-5 max-w-sm space-y-2.5 rounded-2xl bg-bone/70 p-5 text-right text-sm ring-1 ring-ink/8">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-foreground/55">روز</dt>
          <dd className="font-bold text-ink">{done.dayJalali}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-foreground/55">ساعت</dt>
          <dd className="font-bold text-ink">{done.slotLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-foreground/55">پزشک</dt>
          <dd className="font-bold text-ink">{done.doctor}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-foreground/55">هزینه و پرداخت</dt>
          <dd className="font-bold text-ink">
            {faNumber(done.feeToman)} تومان —{" "}
            {done.paymentMethod === "online" ? "پرداخت آنلاین" : "پرداخت در مطب"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3 border-t border-ink/10 pt-2.5">
          <dt className="shrink-0 text-foreground/55">آدرس</dt>
          <dd className="text-left text-[12px] leading-6 font-bold text-ink">{done.address}</dd>
        </div>
      </dl>

      <p className="mt-4 text-[11px] leading-5 text-foreground/50">
        {done.smsConnected
          ? "پیامک تأیید نوبت برای شما ارسال شد."
          : "پنل پیامک به‌زودی متصل می‌شود؛ تا آن زمان همین صفحه رسید نوبت شماست."}
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        <Button variant="outline" className="gap-1.5" onClick={downloadIcs}>
          <Download size={15} aria-hidden />
          افزودن به تقویم
        </Button>
        <Button variant="outline" asChild className="gap-1.5">
          <a href={`tel:${SITE.phone}`} dir="ltr">
            <Phone size={15} aria-hidden />
            {SITE.phoneDisplay}
          </a>
        </Button>
        <Button variant="outline" asChild className="gap-1.5">
          <a href={SITE.maps} target="_blank" rel="noopener noreferrer">
            <MapPin size={15} aria-hidden />
            مسیر مطب
          </a>
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2.5">
        <Button asChild variant="ghost" className="gap-1.5 text-foreground/60">
          <Link href="/">
            <Home size={15} aria-hidden />
            صفحه اصلی
          </Link>
        </Button>
        <Button variant="ghost" onClick={onReset} className="gap-1.5 text-foreground/60">
          <CalendarCheck size={15} aria-hidden />
          رزرو نوبت جدید
        </Button>
      </div>
    </motion.div>
  );
}

