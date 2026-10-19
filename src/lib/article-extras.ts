/* ============================================================
   article-extras — تحلیل ساختاری بدنه مقاله برای AEO/GEO/SXO
   از بدنه مارک‌داون این‌ها استخراج می‌شود:
   - پاسخ کوتاه (اولین بلاک‌کوت) → باکس پاسخ + schema
   - فهرست مطالب (H2) → TOC چسبان با انکر (SXO)
   - پرسش‌های پرتکرار (H3 زیر بخش FAQ) → FAQPage schema (AEO)
   - تعداد کلمه / زمان مطالعه → UX signal
   ============================================================ */

export type TocItem = { id: string; title: string };
export type FaqItem = { q: string; a: string };

export type ArticleExtras = {
  answer: string | null;
  toc: TocItem[];
  faq: FaqItem[];
  wordCount: number;
  readMinutes: number;
};

/** متن ساده از children مارک‌داون (برای ساخت id قابل تکرار) — مشترک با article-body */
export function headingId(title: string, index: number): string {
  const clean = title
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `sec-${index + 1}-${clean || "بخش"}`;
}

export function parseArticle(body: string): ArticleExtras {
  const lines = body.split("\n");

  /* پاسخ کوتاه — اولین بلاک‌کوت (> ...) */
  let answer: string | null = null;
  const answerStart = lines.findIndex((l) => l.trimStart().startsWith(">"));
  if (answerStart !== -1) {
    const buf: string[] = [];
    for (let i = answerStart; i < lines.length; i++) {
      const l = lines[i];
      if (l.trimStart().startsWith(">")) buf.push(l.trimStart().replace(/^>\s?/, ""));
      else if (l.trim() === "") continue;
      else break;
    }
    answer = buf.join(" ").trim() || null;
  }

  /* TOC از H2 + FAQ از H3های بخش پرسش‌ها */
  const toc: TocItem[] = [];
  const faq: FaqItem[] = [];
  let inFaqSection = false;
  let currentFaq: FaqItem | null = null;
  let h2Index = -1;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      h2Index++;
      const title = line.slice(3).trim();
      toc.push({ id: headingId(title, h2Index), title });
      inFaqSection = /پرسش|سوال|پرسش‌های|سوالات/.test(title);
      currentFaq = null;
    } else if (line.startsWith("### ")) {
      const title = line.slice(4).trim();
      if (inFaqSection) {
        currentFaq = { q: title, a: "" };
        faq.push(currentFaq);
      }
    } else if (currentFaq && line && !line.startsWith("#")) {
      currentFaq.a = (currentFaq.a ? currentFaq.a + " " : "") + line.replace(/^-\s?/, "").replace(/\*\*/g, "");
    }
  }

  const wordCount = body
    .replace(/[#>*`\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 220));

  return { answer, toc, faq, wordCount, readMinutes };
}
