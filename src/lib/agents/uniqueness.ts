/* ============================================================
   uniqueness — ابزار یکتایی جملات مقالات
   سردبیر ایجنت و QA اسکریپت هر دو از این استفاده می‌کنند:
   ۱) هیچ جمله‌ای نباید داخل خود مقاله تکرار شود
   ۲) هیچ جمله معناداری نباید با مقالات دیگر سایت مشترک باشد
   (مقایسه روی جملات نرمال‌شدهٔ حداقل ۶ کلمه — جملات کوتاهِ
   ساختاری مثل «بله، طبیعی است.» نادیده گرفته می‌شوند)
   ============================================================ */

/** نرمال‌سازی متن فارسی: حذف اعراب/نیم‌فاصله‌های تفاوتی، یکسان‌سازی ی/ک، حذف علائم */
function normalizeFa(s: string): string {
  return s
    .replace(/[\u064B-\u0652\u0670]/g, "") // اعراب و تشدید
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[«»"'“”(){}\[\]#>*`_|.,؛؛:!؟?٪%+\-–—…]/g, " ")
    .replace(/\u200c/g, " ") // نیم‌فاصله → فاصله
    .replace(/\s+/g, " ")
    .trim();
}

/** شکستن مارک‌داون به جمله‌های نرمال‌شده؛ فقط جمله‌های معنادار (>= ۶ کلمه) برمی‌گردد */
export function significantSentences(body: string): string[] {
  const plain = body
    .replace(/^(#{1,6})\s+/gm, "") // هدینگ‌ها → متن ساده
    .replace(/^>\s?/gm, "") // بلاک‌کوت
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // لینک → متن لنگر
    .replace(/\*\*([^*]+)\*\*/g, "$1"); // بولد
  const seen = new Set<string>();
  for (const raw of plain.split(/[\n.؟?!؛]+/)) {
    const norm = normalizeFa(raw);
    if (norm.split(" ").filter(Boolean).length >= 6) seen.add(norm);
  }
  return [...seen];
}

/** شمارش کلمات مقاله (همان روش سردبیر — مارک‌داون لخت می‌شود) */
export function countWords(body: string): number {
  return body
    .replace(/[#>*`]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * جمله‌های مشترک بین یک مقاله و مجموعه مقالات دیگر.
 * برای چک سردبیر ایجنت (قبل از انتشار) و QA دوره‌ای استفاده می‌شود.
 */
export function repeatedSentences(body: string, otherBodies: string[], limit = 5): string[] {
  const mine = new Set(significantSentences(body));
  if (!mine.size) return [];
  const out: string[] = [];
  for (const other of otherBodies) {
    for (const s of significantSentences(other)) {
      if (mine.has(s) && !out.includes(s)) {
        out.push(s);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}

/** تکرار داخل خود مقاله — خطای نوشتاری مدل زبانی را می‌گیرد */
export function selfRepeatedSentences(body: string, limit = 3): string[] {
  const all = significantSentences(body);
  const counts = new Map<string, number>();
  for (const s of all) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, n]) => n > 1)
    .slice(0, limit)
    .map(([s, n]) => `${s.slice(0, 60)}… (×${n})`);
}
