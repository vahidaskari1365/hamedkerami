import { ARTICLE_KEYWORDS } from "../src/lib/seo-keywords";
import { BLOG_ARTICLES } from "../src/lib/blog-articles";
import { readFileSync, existsSync } from "node:fs";

/* ============================================================
   ممیزی استفاده از کلمات کلیدی — کلمه کانونی هر مقاله کجای
   صفحه آمده؟ (عنوان SERP، چکیده/متا، پاراگراف اول، H2ها، بدنه)
   منبع بدنه: content-fixes/<slug>.md (نسخه زنده پروداکشن)
   وگرنه سید src/lib/articles — خروجی: جدول فارسی + شکاف‌ها
   اجرا: npx tsx scripts/keyword-audit.ts
   ============================================================ */

function splitFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const km = line.match(/^(title|excerpt|cover):\s*(.*)$/);
    if (km) meta[km[1]] = km[2].trim();
  }
  return { meta, body: m[2] };
}

type Check = {
  slug: string;
  titleKw: boolean;
  excerptKw: boolean;
  firstParaKw: boolean;
  h2Kw: boolean;
  bodyKw: boolean;
  secondaryInBody: string[]; // کلمات ثانویه حاضر در بدنه
  secondaryMissing: string[];
  focus: string;
  wordCount: number;
};

function norm(s: string): string {
  return s
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function wordCount(body: string): number {
  return body.replace(/[#>*`|]/g, " ").split(/\s+/).filter(Boolean).length;
}

async function main() {
  const bySlug = new Map(BLOG_ARTICLES.map((a) => [a.slug, a]));
  const results: Check[] = [];

  for (const [slug, kwStr] of Object.entries(ARTICLE_KEYWORDS)) {
    const art = bySlug.get(slug);
    if (!art) {
      console.log(`⚠ مقاله ${slug} در سید نیست`);
      continue;
    }
    /* نسخه زنده پروداکشن: content-fixes در صورت وجود */
    const fixPath = `content-fixes/${slug}.md`;
    let title = art.title;
    let excerpt = art.excerpt;
    let body = art.body;
    if (existsSync(fixPath)) {
      const parsed = splitFrontmatter(readFileSync(fixPath, "utf-8"));
      title = parsed.meta.title ?? title;
      excerpt = parsed.meta.excerpt ?? excerpt;
      body = parsed.body;
    }
    const kws = kwStr.split(",").map((k) => norm(k.trim()));
    const focus = kws[0];
    title = norm(title);
    excerpt = norm(excerpt);

    /* پاراگراف اول: اولین پاراگراف غیر بلاک‌کوت بدنه */
    const paras = body
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const firstPara = norm(paras.filter((p) => !p.startsWith(">"))[0] ?? "");

    const h2s = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => norm(m[1]));
    const nbody = norm(body);

    const secondary = kws.slice(1);
    const secondaryInBody = secondary.filter((k) => nbody.includes(k));
    const secondaryMissing = secondary.filter((k) => !nbody.includes(k));

    results.push({
      slug,
      titleKw: title.includes(focus),
      excerptKw: excerpt.includes(focus),
      firstParaKw: firstPara.includes(focus),
      h2Kw: h2s.some((h) => h.includes(focus)),
      bodyKw: nbody.includes(focus),
      secondaryInBody,
      secondaryMissing,
      focus,
      wordCount: wordCount(body),
    });
  }

  /* گزارش */
  console.log("\n════════ ممیزی استفاده از کلمات کلیدی (۱۸ مقاله سید) ════════\n");
  console.log(
    "اسلاگ".padEnd(34),
    "عنوان",
    "چکیده",
    "پاراگراف۱",
    "H2",
    "بدنه",
    "کلمات",
    "ثانویه در بدنه",
  );
  let full = 0;
  for (const r of results) {
    const mark = (b: boolean) => (b ? "✓" : "✗");
    const sec = `${r.secondaryInBody.length}/${r.secondaryInBody.length + r.secondaryMissing.length}`;
    console.log(
      r.slug.padEnd(34),
      mark(r.titleKw).padEnd(6),
      mark(r.excerptKw).padEnd(6),
      mark(r.firstParaKw).padEnd(9),
      mark(r.h2Kw).padEnd(3),
      mark(r.bodyKw).padEnd(5),
      String(r.wordCount).padEnd(6),
      sec,
    );
    if (r.titleKw && r.excerptKw && r.firstParaKw && r.h2Kw && r.bodyKw) full++;
  }
  console.log(`\nکامل (هر ۵ جایگاه): ${full}/${results.length}`);

  const gaps = results.filter((r) => !(r.titleKw && r.excerptKw && r.firstParaKw && r.h2Kw && r.bodyKw));
  if (gaps.length) {
    console.log("\n── شکاف‌ها ──");
    for (const g of gaps) {
      const miss: string[] = [];
      if (!g.titleKw) miss.push("عنوان");
      if (!g.excerptKw) miss.push("چکیده");
      if (!g.firstParaKw) miss.push("پاراگراف اول");
      if (!g.h2Kw) miss.push("H2");
      if (!g.bodyKw) miss.push("بدنه");
      console.log(`  ${g.slug} [${g.focus}] ← فاقد در: ${miss.join("، ")}`);
    }
  }

  /* کلمات ثانویه غایب — فرصت محتوایی، نه خطا */
  const missingSec = results.filter((r) => r.secondaryMissing.length > 0);
  if (missingSec.length) {
    console.log("\n── کلمات ثانویه غایب در بدنه (فرصت بهینه‌سازی) ──");
    for (const m of missingSec) {
      console.log(`  ${m.slug}: ${m.secondaryMissing.join(" | ")}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
