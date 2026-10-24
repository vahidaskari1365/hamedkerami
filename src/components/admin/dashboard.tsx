"use client";

/* ============================================================
   داشبورد ادمین — آمار گرافیکی بازدیدکنندگان + پیام‌ها
   ============================================================ */

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Eye, Users, MousePointerClick, Mail, Monitor, Smartphone, Tablet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  daily: { day: string; views: number }[];
  topPaths: { path: string; views: number }[];
  referrers: { source: string; views: number }[];
  devices: { device: string; views: number }[];
  browsers: { browser: string; views: number }[];
  totals: { today: number; week: number; period: number; all: number; uniqueSessions: number };
  messagesCount: number;
  latestMessages: { id: string; name: string; email: string; subject: string; createdAt: string }[];
}

const DEVICE_META: Record<string, { label: string; color: string }> = {
  mobile: { label: "موبایل", color: "#0f8a8d" },
  desktop: { label: "دسکتاپ", color: "#134e4a" },
  tablet: { label: "تبلت", color: "#f59e0b" },
};

const RANGES = [
  { days: 7, label: "۷ روز" },
  { days: 14, label: "۱۴ روز" },
  { days: 30, label: "۳۰ روز" },
  { days: 90, label: "۹۰ روز" },
];

function faDate(ymd: string): string {
  try {
    return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return ymd;
  }
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "mobile") return <Smartphone size={16} />;
  if (device === "tablet") return <Tablet size={16} />;
  return <Monitor size={16} />;
}

export function Dashboard() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (withSpinner = true) => {
    if (withSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?days=${days}`);
      const data = await res.json();
      if (data.ok) setStats(data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    /* میکروتسک — بدون setState همگام در بدنه effect (react-compiler) */
    queueMicrotask(() => void load(false));
  }, [load]);

  const chartData = (stats?.daily ?? []).map((d) => ({
    ...d,
    label: faDate(d.day),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">داشبورد</h1>
          <p className="mt-1 text-xs text-foreground/50">آمار بازدید سایت و پیام‌های اخیر</p>
        </div>
        <div className="flex gap-1.5 rounded-full bg-bone p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                days === r.days ? "bg-ink text-white shadow" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* کارت‌های خلاصه */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: "بازدید امروز", value: stats?.totals.today, icon: <Eye size={18} /> },
          { label: "۷ روز گذشته", value: stats?.totals.week, icon: <Eye size={18} /> },
          { label: `بازدید یکتا (${days} روز)`, value: stats?.totals.uniqueSessions, icon: <Users size={18} /> },
          { label: "کل بازدیدها", value: stats?.totals.all, icon: <MousePointerClick size={18} /> },
          { label: `پیام‌ها (${days} روز)`, value: stats?.messagesCount, icon: <Mail size={18} /> },
        ].map((c) => (
          <Card key={c.label} className="border-ink/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-teal">{c.icon}</div>
              <p className="mt-2 text-2xl font-black tabular-nums" style={{ fontVariantNumeric: "normal" }}>
                {loading ? "…" : (c.value ?? 0).toLocaleString("fa-IR")}
              </p>
              <p className="mt-1 text-[11px] font-bold text-foreground/50">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* نمودار روند روزانه */}
      <Card className="border-ink/10">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-black">روند بازدید روزانه</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f8a8d" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0f8a8d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} width={34} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #0f8a8d33", fontSize: 12, fontFamily: "inherit" }}
                  formatter={(v) => [`${Number(v).toLocaleString("fa-IR")} بازدید`, ""]}
                />
                <Area type="monotone" dataKey="views" stroke="#0f8a8d" strokeWidth={2.5} fill="url(#viewsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* پر بازدیدترین صفحات */}
        <Card className="border-ink/10 lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-black">پربازدیدترین صفحات</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2.5">
              {(stats?.topPaths ?? []).map((p) => {
                const max = stats?.topPaths[0]?.views || 1;
                return (
                  <div key={p.path} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-xs font-bold" dir="ltr">
                      {p.path === "/" ? "خانه" : p.path}
                    </span>
                    <div className="h-6 flex-1 overflow-hidden rounded-full bg-bone">
                      <div
                        className="flex h-full items-center justify-end rounded-full bg-teal/80 pl-2 pr-1 text-[10px] font-bold text-white transition-all"
                        style={{ width: `${Math.max(14, (p.views / max) * 100)}%` }}
                      >
                        {p.views.toLocaleString("fa-IR")}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(stats?.topPaths ?? []).length === 0 && !loading ? (
                <p className="py-6 text-center text-xs text-foreground/40">هنوز بازدیدی ثبت نشده</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* دستگاه‌ها */}
        <Card className="border-ink/10">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-black">دستگاه بازدیدکنندگان</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-40" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(stats?.devices ?? []).map((d) => ({
                      name: DEVICE_META[d.device]?.label ?? d.device,
                      value: d.views,
                      color: DEVICE_META[d.device]?.color ?? "#999",
                    }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={38}
                    outerRadius={64}
                    paddingAngle={3}
                  >
                    {(stats?.devices ?? []).map((d) => (
                      <Cell key={d.device} fill={DEVICE_META[d.device]?.color ?? "#999"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #0f8a8d33", fontSize: 12 }}
                    formatter={(v, n) => [`${Number(v).toLocaleString("fa-IR")}`, String(n)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1.5">
              {(stats?.devices ?? []).map((d) => (
                <div key={d.device} className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-foreground/70">
                    <span style={{ color: DEVICE_META[d.device]?.color }}>
                      <DeviceIcon device={d.device} />
                    </span>
                    {DEVICE_META[d.device]?.label ?? d.device}
                  </span>
                  <span className="tabular-nums" style={{ fontVariantNumeric: "normal" }}>
                    {d.views.toLocaleString("fa-IR")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* منابع ورود */}
        <Card className="border-ink/10">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-black">منابع ورود</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-44" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(stats?.referrers ?? []).map((r) => ({
                    label: r.source === "مستقیم" ? "مستقیم" : r.source.replace(/^https?:\/\/(www\.)?/, "").slice(0, 18),
                    views: r.views,
                  }))}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    width={90}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #0f8a8d33", fontSize: 12 }}
                    formatter={(v) => [`${Number(v).toLocaleString("fa-IR")} بازدید`, ""]}
                  />
                  <Bar dataKey="views" fill="#134e4a" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* آخرین پیام‌ها */}
        <Card className="border-ink/10">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-black">آخرین پیام‌های تماس</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="max-h-44 space-y-2 overflow-y-auto">
              {(stats?.latestMessages ?? []).map((m) => (
                <div key={m.id} className="rounded-lg bg-bone p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-extrabold">{m.name}</p>
                    <p className="text-[10px] text-foreground/40" dir="ltr">
                      {m.email}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-foreground/60">{m.subject}</p>
                </div>
              ))}
              {(stats?.latestMessages ?? []).length === 0 && !loading ? (
                <p className="py-6 text-center text-xs text-foreground/40">پیامی ثبت نشده</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
