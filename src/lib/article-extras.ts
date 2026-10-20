/* ============================================================
   article-extras — تحلیل ساختاری بدنه مقاله برای AEO/GEO/SXO
   از بدنه مارک‌داون این‌ها استخراج می‌شود:
   - پاسخ کوتاه (اولین بلاک‌کوت) → باکس پاسخ + schema
   - بخش‌بندی کامل (H2) → کارت‌های جدا برای هر بخش (تفکیک بصری)
   - فهرست مطالب (H2) → TOC چسبان با انکر (SXO)
   - پرسش‌های پرتکرار (H3 زیر بخش پرسش‌ها) → آکاردئون + FAQPage schema
   - باکس‌های نکته/هشدار/مهم → کال‌اوت رنگی (خوانایی/SXO)
   - تعداد کلمه / زمان مطالعه → UX signal
   ============================================================ */

export type TocItem = { id: string; title: string };
export type FaqItem = { q: string; a: string };

export type CalloutVariant = "tip" | "warn" | "note";

export type ArticleBlock =
  | { kind: "md"; content: string }
  | { kind: "callout"; variant: CalloutVariant; title: string; content: string }
  | { kind: "faq"; items: FaqItem[] };

export type ArticleSection = {
  id: string | null; // null = مقدمه (قبل از اولین H2)
  index: number; // شماره بخش از ۱ — برای بج شماره‌دار
  title: string | null;
  blocks: ArticleBlock[];
};

export type ArticleExtras = {
  answer: string | null;
  toc: TocItem[];
  sections: ArticleSection[];
  faq: FaqItem[];
  wordCount: number;
  readMinutes: number;
};

/** id هدینگ — پیاده‌سازی مشترک بین پارس و رندر */
export function headingId(title: string, index: number): string {
  const clean = title
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `sec-${index + 1}-${clean || "بخش"}`;
}

/* آشکارساز کال‌اوت — «نکته:» / «**هشدار:**» / «مهم:» در ابتدای پاراگراف */
const CALLOUT_RULES: Array<{
  re: RegExp;
  variant: CalloutVariant;
  title: string;
}> = [
  { re: /^\*?\*?هشدار\s*[:：]\*?\*?\s*/, variant: "warn", title: "هشدار" },
  { re: /^\*?\*?خطر\s*[:：]\*?\*?\s*/, variant: "warn", title: "هشدار" },
  { re: /^\*?\*?نکته\s*[:：]\*?\*?\s*/, variant: "tip", title: "نکته" },
  { re: /^\*?\*?توجه\s*[:：]\*?\*?\s*/, variant: "note", title: "توجه" },
  { re: /^\*?\*?مهم\s*[:：]\*?\*?\s*/, variant: "note", title: "مهم" },
];

/** متن ساده از children مارک‌داون (برای ساخت id قابل تکرار) — مشترک با article-body */
export function plainText(children: unknown): string {
  if (children === null || children === undefined) return "";
  if (typeof children === "string" || typeof children === "number")
    return String(children);
  if (Array.isArray(children)) return children.map(plainText).join("");
  if (typeof children === "object" && "props" in (children as object)) {
    return plainText((children as { props?: { children?: unknown } }).props?.children);
  }
  return "";
}

/** تقسیم بدنه به پاراگراف‌گروه‌ها (تفکیک با خط خالی) */
function toGroups(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((g) => g.trim())
    .filter(Boolean);
}

export function parseArticle(body: string): ArticleExtras {
  const groups = toGroups(body);

  /* ---------- پاسخ کوتاه — اولین بلاک‌کوت (برای schema) ---------- */
  let answer: string | null = null;
  const firstQuote = groups.find((g) => g.trimStart().startsWith(">"));
  if (firstQuote) {
    answer = firstQuote
      .split("\n")
      .map((l) => l.trimStart().replace(/^>\s?/, ""))
      .join(" ")
      .trim() || null;
  }

  /* ---------- بخش‌بندی، کال‌اوت‌ها و FAQ ---------- */
  const sections: ArticleSection[] = [];
  const toc: TocItem[] = [];
  const faq: FaqItem[] = [];

  let current: ArticleSection = {
    id: null,
    index: 0,
    title: null,
    blocks: [],
  };
  let h2Count = 0; // شمارنده مستقل H2 — مقدمه در شماره‌گذاری نمی‌آید
  const flushSection = () => {
    if (current.blocks.length) sections.push(current);
  };
  const flushFaq = () => {
    if (faq.length) {
      current.blocks.push({ kind: "faq", items: [...faq] });
      faq.length = 0;
    }
  };

  let inFaqSection = false;

  for (const group of groups) {
    const firstLine = group.split("\n")[0].trim();

    /* --- هدینگ بخش (H2) --- */
    if (firstLine.startsWith("## ")) {
      flushFaq();
      flushSection();
      const title = firstLine.slice(3).trim();
      h2Count += 1;
      const id = headingId(title, h2Count - 1);
      toc.push({ id, title });
      current = {
        id,
        index: h2Count,
        title,
        blocks: [],
      };
      inFaqSection = /پرسش|سوال/.test(title);
      /* خودِ خط H2 داخل بدنه بخش تکرار نمی‌شود — کارتِ بخش، تیتر را رندر می‌کند */
      const rest = group.split("\n").slice(1).join("\n").trim();
      if (rest) pushContent(rest);
      continue;
    }

    /* --- پرسش FAQ (H3 داخل بخش پرسش‌ها) --- */
    if (inFaqSection && firstLine.startsWith("### ")) {
      faq.push({ q: firstLine.slice(4).trim(), a: "" });
      continue;
    }

    /* --- ادامه پاسخ سوال قبلی --- */
    if (faq.length && !firstLine.startsWith("#")) {
      const last = faq[faq.length - 1];
      last.a = (last.a ? last.a + " " : "") + group.replace(/\n+/g, " ");
      continue;
    }

    pushContent(group);
  }
  flushFaq();
  flushSection();

  /* فهرست کامل FAQ برای schema.org/FAQPage (AEO) */
  const allFaq: FaqItem[] = [];
  for (const s of sections) {
    for (const b of s.blocks) {
      if (b.kind === "faq") allFaq.push(...b.items);
    }
  }

  function pushContent(group: string) {
    const firstLine = group.split("\n")[0].trim();
    for (const rule of CALLOUT_RULES) {
      const m = firstLine.match(rule.re);
      if (m) {
        const contentLines = [firstLine.slice(m[0].length), ...group.split("\n").slice(1)];
        current.blocks.push({
          kind: "callout",
          variant: rule.variant,
          title: rule.title,
          content: contentLines.join("\n").trim(),
        });
        return;
      }
    }
    current.blocks.push({ kind: "md", content: group });
  }

  /* ---------- آمار ---------- */
  const wordCount = body
    .replace(/[#>*`\-|]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 220));

  return { answer, toc, sections, faq: allFaq, wordCount, readMinutes };
}
