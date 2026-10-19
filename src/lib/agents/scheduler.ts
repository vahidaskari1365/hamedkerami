/* ============================================================
   scheduler — اجرای روزانه ایجنت‌های بلاگ ساعت ۷ صبح تهران
   بدون وابستگی به node-cron: هر ۵ دقیقه چک می‌کند و وقتی
   ساعت تهران به ۰۷:۰۰+ رسید و امروز اجرا نشده، پایپ‌لاین را
   fire-and-forget اجرا می‌کند (خطاها پایپ‌لاین خودش می‌گیرد).
   ============================================================ */

let started = false;

function tehranNow(): { date: string; hhmm: string } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hhmm: `${parts.hour}:${parts.minute}` };
}

export function startBlogScheduler(): void {
  if (started) return;
  started = true;

  const tick = async () => {
    try {
      const { hhmm } = tehranNow();
      const hour = parseInt(hhmm.slice(0, 2), 10);
      /* پنجره اجرا: ۰۷:۰۰ تا ۰۹:۵۹ — اگر سرور در آن ساعت down بود،
         اولین tick در ساعات ۷ تا ۹ اجرا می‌کند؛ بعد از آن فردا */
      if (hour < 7 || hour > 9) return;
      const { runDailyBlog } = await import("@/lib/agents/pipeline");
      await runDailyBlog(false);
    } catch (e) {
      console.error("[agents/scheduler] tick failed:", (e as Error).message);
    }
  };

  /* اولین چک بعد از ۲ دقیقه (بعد از بالا آمدن کامل سرور)، بعد هر ۵ دقیقه */
  setTimeout(() => {
    void tick();
    setInterval(() => void tick(), 5 * 60 * 1000);
  }, 2 * 60 * 1000);

  console.log("[agents/scheduler] فعال شد — اجرای روزانه ۰۷:۰۰ تهران");
}
