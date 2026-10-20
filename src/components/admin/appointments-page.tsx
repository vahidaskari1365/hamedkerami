"use client";

/* ---------- نوبت‌های آنلاین — مدیریت در پنل ----------
   هر رزرو نشان می‌دهد: چه کسی (نام/شماره)، چه روزی (شمسی)،
   چه دکتری و چه بازه ساعتی — با تغییر وضعیت و حذف */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CalendarCheck, CircleCheck, CircleX, Clock, Phone, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "در انتظار تأیید", cls: "bg-amber-100 text-amber-800 ring-amber-200" },
  confirmed: { label: "تأیید شده", cls: "bg-teal/10 text-teal ring-teal/20" },
  done: { label: "انجام شد", cls: "bg-ink/8 text-ink/70 ring-ink/15" },
  canceled: { label: "لغو شده", cls: "bg-red-100 text-red-700 ring-red-200" },
};

const FILTERS = [
  { key: "", label: "همه" },
  { key: "pending", label: "در انتظار" },
  { key: "confirmed", label: "تأییدشده" },
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<Appt | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/appointments");
      const data = await res.json();
      setRows(data.ok ? data.rows : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
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

  const shown = useMemo(
    () => (filter ? rows.filter((r) => r.status === filter) : rows),
    [rows, filter],
  );
  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black">نوبت‌های آنلاین</h1>
        <p className="mt-1 text-xs text-foreground/50">
          رزروهای ثبت‌شده از صفحه نوبت‌دهی — {rows.length.toLocaleString("fa-IR")} نوبت
          {pendingCount > 0 ? ` (${pendingCount.toLocaleString("fa-IR")} در انتظار تأیید)` : ""}
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
              {f.label} {count > 0 ? `(${count.toLocaleString("fa-IR")})` : ""}
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
                  </p>
                  <p className="mt-0.5 truncate text-xs text-foreground/50">
                    {a.dayJalali}
                    {a.slot && a.slot !== "فرقی نمی‌کند" ? ` — ${a.slot}` : ""}
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
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
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
                <span className="font-bold">بازه:</span> {open.slot || "فرقی نمی‌کند"}
              </p>
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
    </div>
  );
}
