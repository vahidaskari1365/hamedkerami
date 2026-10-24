"use client";

/* ---------- نوبت‌های آنلاین — مدیریت در پنل (فاز ۲) ----------
   رزروهای تأییدشده با کد پیامکی: کد رهگیری، مشخصات بیمار،
   تعرفه و روش پرداخت + صف پیام‌های اپراتور/بیمار ---------- */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BellRing,
  CalendarCheck,
  CalendarClock,
  CircleCheck,
  CircleX,
  Clock,
  Phone,
  RefreshCcw,
  Send,
  Trash2,
  Wallet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SLOTS, faNumber } from "@/lib/booking/shared";

/* برچسب بازه — نوبت‌های جدید شناسه «15:00» دارند، قدیمی‌ها متن آزاد */
function slotText(slot: string): string {
  return SLOTS.find((s) => s.id === slot)?.label ?? slot;
}

interface Appt {
  id: string;
  name: string;
  phone: string;
  doctor: string;
  dayIso: string;
  dayJalali: string;
  slot: string;
  note: string;
  status: string;
  latinName?: string;
  gender?: string;
  birthYear?: string;
  feeToman?: number;
  paymentMethod?: string;
  trackingCode?: string;
  createdAt: string;
}

interface Notif {
  id: string;
  bookingId: string;
  kind: string; // operator_sms | patient_sms
  to: string;
  body: string;
  status: string; // queued | sent | failed
  error: string;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "در انتظار تأیید (قدیمی)", cls: "bg-amber-100 text-amber-800 ring-amber-200" },
  confirmed: { label: "تأیید شده", cls: "bg-teal/10 text-teal ring-teal/20" },
  done: { label: "انجام شد", cls: "bg-ink/8 text-ink/70 ring-ink/15" },
  canceled: { label: "لغو شده", cls: "bg-red-100 text-red-700 ring-red-200" },
};

const NOTIF_META: Record<string, { label: string; cls: string }> = {
  queued: { label: "در صف", cls: "bg-amber-100 text-amber-800 ring-amber-200" },
  sent: { label: "ارسال شد", cls: "bg-teal/10 text-teal ring-teal/20" },
  failed: { label: "ناموفق", cls: "bg-red-100 text-red-700 ring-red-200" },
};

const FILTERS = [
  { key: "", label: "همه" },
  { key: "confirmed", label: "تأییدشده" },
  { key: "pending", label: "قدیمی/در انتظار" },
  { key: "done", label: "انجام‌شده" },
  { key: "canceled", label: "لغوشده" },
];

function waPatient(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `98${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}

export function AppointmentsPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Appt[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<Appt | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const load = useCallback(async (withSpinner = true) => {
    if (withSpinner) setLoading(true);
    try {
      const [apptRes, notifRes] = await Promise.all([
        fetch("/api/admin/appointments"),
        fetch("/api/admin/booking-notifications").catch(() => null),
      ]);
      const apptData = await apptRes.json();
      setRows(apptData.ok ? apptData.rows : []);
      if (notifRes?.ok) {
        const notifData = await notifRes.json();
        setNotifs(notifData.ok ? notifData.rows : []);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    /* میکروتسک — بدون setState همگام در بدنه effect (react-compiler) */
    queueMicrotask(() => void load(false));
  }, [load]);

  async function setStatus(appt: Appt, status: string) {
    const res = await fetch(`/api/admin/appointments/${appt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.ok) {
      toast({ title: `وضعیت: ${STATUS_META[status]?.label ?? status}` });
      setOpen(null);
      load();
    } else {
      toast({ title: data.error || "خطا", variant: "destructive" });
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      toast({ title: "نوبت حذف شد" });
      setOpen(null);
      load();
    }
  }

  async function retryNotif(id: string) {
    setRetrying(id);
    try {
      const res = await fetch("/api/admin/booking-notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "پیام ارسال شد" });
      } else {
        toast({ title: data.error || "ارسال نشد", variant: "destructive" });
      }
      load();
    } finally {
      setRetrying(null);
    }
  }

  const shown = useMemo(
    () => (filter ? rows.filter((r) => r.status === filter) : rows),
    [rows, filter],
  );
  const todayIsoRows = rows.filter((r) => r.dayIso === new Date().toISOString().slice(0, 10)).length;
  const queuedNotifs = notifs.filter((n) => n.status === "queued").length;

  return (
    <div className="space-y-7">
      {/* ================= نوبت‌ها ================= */}
      <div>
        <h1 className="text-xl font-black">نوبت‌های آنلاین</h1>
        <p className="mt-1 text-xs text-foreground/50">
          رزروهای تأییدشده با کد پیامکی از صفحه نوبت‌دهی — {faNumber(rows.length)} نوبت
          {todayIsoRows > 0 ? ` (${faNumber(todayIsoRows)} نوبت برای امروز)` : ""}
        </p>
      </div>

      {/* فیلتر وضعیت */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const count = f.key ? rows.filter((r) => r.status === f.key).length : rows.length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filter === f.key
                  ? "bg-ink text-white shadow"
                  : "bg-bone text-foreground/60 hover:text-foreground"
              }`}
            >
              {f.label} {count > 0 ? `(${faNumber(count)})` : ""}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-bone" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center text-sm text-foreground/50">
          نوبتی با این وضعیت ثبت نشده است
        </div>
      ) : (
        <div className="space-y-2.5">
          {shown.map((a) => {
            const meta = STATUS_META[a.status] ?? STATUS_META.pending;
            return (
              <div
                key={a.id}
                role="button"
                tabIndex={0}
                onClick={() => setOpen(a)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setOpen(a);
                }}
                className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 text-right shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10 text-teal">
                  <CalendarClock size={16} />
                </div>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold">
                    {a.name}
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {a.doctor}
                    </Badge>
                    {a.trackingCode ? (
                      <span dir="ltr" className="text-[10px] font-black tracking-wider text-teal-3">
                        {a.trackingCode}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-foreground/50">
                    {a.dayJalali}
                    {a.slot ? ` — ${slotText(a.slot)}` : ""}
                    {a.feeToman ? ` — ${faNumber(a.feeToman)} تومان` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${meta.cls}`}>
                    {meta.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(a.id);
                    }}
                    aria-label="حذف نوبت"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* جزئیات نوبت */}
      {open ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black">{open.name}</h3>
                <p className="mt-1 text-xs text-foreground/50" dir="ltr">
                  {open.phone}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-black ring-1 ${
                  (STATUS_META[open.status] ?? STATUS_META.pending).cls
                }`}
              >
                {(STATUS_META[open.status] ?? STATUS_META.pending).label}
              </span>
            </div>

            {open.trackingCode ? (
              <p className="mt-3 inline-block rounded-lg bg-ink px-3 py-1.5 text-xs font-black tracking-widest text-gold-soft" dir="ltr">
                {open.trackingCode}
              </p>
            ) : null}

            <div className="mt-4 space-y-2.5 rounded-xl bg-bone p-4 text-sm">
              <p className="flex items-center gap-2">
                <CalendarCheck size={15} className="shrink-0 text-teal" />
                <span className="font-bold">روز:</span> {open.dayJalali}
              </p>
              <p className="flex items-center gap-2">
                <CircleCheck size={15} className="shrink-0 text-teal" />
                <span className="font-bold">پزشک:</span> {open.doctor}
              </p>
              <p className="flex items-center gap-2">
                <Clock size={15} className="shrink-0 text-teal" />
                <span className="font-bold">بازه:</span> {slotText(open.slot) || "فرقی نمی‌کند"}
              </p>
              {open.feeToman ? (
                <p className="flex items-center gap-2">
                  <Wallet size={15} className="shrink-0 text-teal" />
                  <span className="font-bold">هزینه:</span> {faNumber(open.feeToman)} تومان —{" "}
                  {open.paymentMethod === "online" ? "پرداخت آنلاین" : "پرداخت در مطب"}
                </p>
              ) : null}
              {open.latinName ? (
                <p>
                  <span className="font-bold">نام لاتین:</span>{" "}
                  <span dir="ltr">{open.latinName}</span>
                </p>
              ) : null}
              {open.gender ? (
                <p>
                  <span className="font-bold">جنسیت:</span> {open.gender === "female" ? "خانم" : "آقا"}
                </p>
              ) : null}
              {open.birthYear ? (
                <p>
                  <span className="font-bold">سال تولد:</span>{" "}
                  {faNumber(Number(open.birthYear))}
                </p>
              ) : null}
              {open.note ? (
                <p className="border-t border-ink/10 pt-2.5 leading-6">
                  <span className="font-bold">یادداشت بیمار:</span> {open.note}
                </p>
              ) : null}
              <p className="text-[11px] text-foreground/40">
                ثبت: {new Date(open.createdAt).toLocaleDateString("fa-IR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" className="gap-1.5" onClick={() => setStatus(open, "confirmed")}>
                <CalendarCheck size={14} />
                تأیید نوبت
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setStatus(open, "done")}>
                <CircleCheck size={14} />
                انجام شد
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-red-600 hover:bg-red-50"
                onClick={() => setStatus(open, "canceled")}
              >
                <CircleX size={14} />
                لغو
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-red-600 hover:bg-red-50"
                onClick={() => remove(open.id)}
              >
                <Trash2 size={14} />
                حذف
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-ink/10 pt-3">
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <a href={`tel:${open.phone}`} dir="ltr">
                  <Phone size={13} />
                  تماس
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <a href={waPatient(open.phone)} target="_blank" rel="noopener noreferrer">
                  واتسپ بیمار
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ================= پیام‌های اپراتور و بیمار ================= */}
      <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-black">
              <BellRing size={16} className="text-teal" />
              پیام‌های نوبت‌دهی (اپراتور و بیمار)
            </h2>
            <p className="mt-1 text-xs text-foreground/50">
              با هر رزرو جدید، یک پیام برای اپراتور ساخته می‌شود. تا زمانی که پنل پیامک متصل و
              «موبایل اپراتور» در تنظیمات ثبت نشده، پیام‌ها در صف می‌مانند.
            </p>
          </div>
          {queuedNotifs > 0 ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-800 ring-1 ring-amber-200">
              {faNumber(queuedNotifs)} پیام در صف
            </span>
          ) : null}
        </div>

        {notifs.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-ink/15 p-6 text-center text-xs text-foreground/45">
            هنوز پیامی ساخته نشده است
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {notifs.slice(0, 30).map((n) => {
              const meta = NOTIF_META[n.status] ?? NOTIF_META.queued;
              return (
                <div
                  key={n.id}
                  className="rounded-xl border border-ink/10 bg-bone/40 p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black">
                        {n.kind === "operator_sms" ? "پیام اپراتور" : "پیام بیمار"}
                      </span>
                      <span dir="ltr" className="text-foreground/45">
                        {n.to || "بدون گیرنده"}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-black ring-1 ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    {n.status !== "sent" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 px-2 text-[10px]"
                        disabled={retrying === n.id}
                        onClick={() => retryNotif(n.id)}
                      >
                        {retrying === n.id ? (
                          <RefreshCcw size={11} className="animate-spin" />
                        ) : (
                          <Send size={11} />
                        )}
                        تلاش برای ارسال
                      </Button>
                    ) : null}
                  </div>
                  <p className="mt-2 whitespace-pre-line leading-6 text-foreground/70">{n.body}</p>
                  {n.error ? (
                    <p className="mt-1.5 text-[10px] text-amber-700">توضیح: {n.error}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
