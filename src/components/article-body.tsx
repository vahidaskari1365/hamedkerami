"use client";

/* ============================================================
   ArticleBody — رندر بدنه مقاله به صورت کارت‌های تفکیک‌شده
   هر بخش (H2) یک کارت مستقل با شماره و هدینگ رنگی می‌شود تا
   مقاله «حوصله‌سربر» نباشد و خواننده بداند کجاست (SXO).
   - بلاک‌کوت ابتدایی = باکس «پاسخ کوتاه» (AEO)
   - نکته/هشدار/مهم = کال‌اوت رنگی
   - جدول‌ها = جدول استایل‌دار RTL (remark-gfm)
   - پرسش‌های پرتکرار = آکاردئون
   ============================================================ */

import { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ArticleSection, ArticleBlock, CalloutVariant, plainText } from "@/lib/article-extras";

const CALLOUT_STYLE: Record<
  CalloutVariant,
  { box: string; icon: string; label: string }
> = {
  tip: {
    box: "border-teal bg-teal/8 text-teal-3",
    icon: "✦",
    label: "نکته",
  },
  warn: {
    box: "border-destructive bg-destructive/8 text-destructive",
    icon: "⚠",
    label: "هشدار",
  },
  note: {
    box: "border-verdigris bg-verdigris/8 text-accent-foreground",
    icon: "❖",
    label: "توجه",
  },
};

/** شماره بخش با ارقام فارسی */
function faNum(n: number): string {
  return n.toLocaleString("fa-IR");
}

/** رندر یک قطعه مارک‌داون با استایل اختصاصی سایت */
function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mt-5 text-[15px] leading-8 text-foreground/75 first:mt-0 sm:text-base sm:leading-9">
            {children}
          </p>
        ),
        h3: ({ children }) => (
          <h3 className="mt-7 flex items-center gap-2.5 text-base font-black text-ink sm:text-lg">
            <span className="h-4 w-1 rounded-full bg-verdigris" aria-hidden />
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="mt-6 text-[15px] font-black text-ink/85">{children}</h4>
        ),
        ul: ({ children }) => (
          <ul className="mt-5 space-y-2.5">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="flex items-start gap-2.5 text-[15px] leading-8 text-foreground/75">
            <span
              className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-teal/70"
              aria-hidden
            />
            <span>{children}</span>
          </li>
        ),
        ol: ({ children }) => (
          <ol className="mt-5 list-decimal space-y-2.5 pr-5 text-[15px] leading-8 text-foreground/75">
            {children}
          </ol>
        ),
        strong: ({ children }) => (
          <strong className="font-black text-ink">{children}</strong>
        ),
        blockquote: ({ children }) => (
          <div className="rounded-2xl border-r-4 border-teal bg-gradient-to-l from-teal/12 to-teal/4 p-5 sm:p-6">
            <p className="flex items-center gap-2 text-sm font-black text-teal-3">
              <span aria-hidden>✦</span> پاسخ کوتاه
            </p>
            <div className="text-[15px] leading-8 text-foreground/85 [&>*:first-child]:mt-2">
              {children}
            </div>
          </div>
        ),
        a: ({ href, children }) => {
          const isInternal = href?.startsWith("/");
          return isInternal ? (
            <Link
              href={href ?? "/"}
              className="font-bold text-teal-3 underline decoration-teal/40 decoration-2 underline-offset-4 transition hover:decoration-teal"
            >
              {children}
            </Link>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-teal-3 underline decoration-teal/40 decoration-2 underline-offset-4"
            >
              {children}
            </a>
          );
        },
        table: ({ children }) => (
          <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-ink/10">
            <table className="w-full min-w-[480px] border-collapse text-right text-sm">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-ink text-white">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="whitespace-nowrap px-4 py-3 text-right text-[13px] font-black first:rounded-tr-2xl last:rounded-tl-2xl">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-t border-ink/8 px-4 py-3 align-top leading-7 text-foreground/80 odd:bg-bone/40">
            {children}
          </td>
        ),
        hr: () => (
          <div className="my-8 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-ink/10" />
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            <span className="h-px flex-1 bg-ink/10" />
          </div>
        ),
        code: ({ children }) => (
          <code className="rounded-md bg-bone-2 px-1.5 py-0.5 text-[13px] text-ink">
            {children}
          </code>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function CalloutBox({
  variant,
  title,
  content,
}: {
  variant: CalloutVariant;
  title: string;
  content: string;
}) {
  const s = CALLOUT_STYLE[variant];
  return (
    <aside className={`mt-6 rounded-2xl border-r-4 p-5 sm:p-6 ${s.box}`}>
      <p className="flex items-center gap-2 text-sm font-black">
        <span aria-hidden>{s.icon}</span>
        {title}
      </p>
      <div className="text-[15px] leading-8 text-foreground/85 [&>*:first-child]:mt-1.5">
        <Markdown>{content}</Markdown>
      </div>
    </aside>
  );
}

function FaqAccordion({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="mt-6 space-y-3">
      {items.map((f, i) => (
        <details
          key={i}
          className="group overflow-hidden rounded-2xl bg-bone ring-1 ring-ink/8 transition open:bg-white open:ring-teal/35"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-[15px] font-black text-ink [&::-webkit-details-marker]:hidden">
            <span className="flex items-start gap-2.5">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/15 text-xs text-teal-3"
                aria-hidden
              >
                {faNum(i + 1)}
              </span>
              {f.q}
            </span>
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink/60 transition group-open:rotate-45 group-open:bg-teal group-open:text-white"
              aria-hidden
            >
              +
            </span>
          </summary>
          <div className="border-t border-ink/8 px-5 py-4 text-[15px] leading-8 text-foreground/75">
            {f.a}
          </div>
        </details>
      ))}
    </div>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  if (block.kind === "md") return <Markdown>{block.content}</Markdown>;
  if (block.kind === "callout")
    return (
      <CalloutBox
        variant={block.variant}
        title={block.title}
        content={block.content}
      />
    );
  return <FaqAccordion items={block.items} />;
}

/** رندر همه بخش‌های مقاله — هر H2 یک کارت تفکیک‌شده */
export function ArticleBody({ sections }: { sections: ArticleSection[] }) {
  return (
    <div className="article-md space-y-6 sm:space-y-8">
      {sections.map((sec) =>
        sec.title ? (
          <section
            key={sec.id ?? sec.index}
            id={sec.id ?? undefined}
            className="scroll-mt-28 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/6 sm:p-8"
          >
            <header className="mb-4 flex items-start gap-3 border-b border-dashed border-ink/10 pb-4">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-sm font-black text-gold-soft"
                aria-hidden
              >
                {faNum(sec.index)}
              </span>
              <h2 className="text-lg font-black leading-8 text-ink sm:text-xl">
                {sec.title}
              </h2>
            </header>
            {sec.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </section>
        ) : (
          /* مقدمه — بدون کارت؛ باکس پاسخ کوتاه خودش برجسته است */
          <div key="intro" className="px-1">
            {sec.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>
        ),
      )}
    </div>
  );
}

/** برای رندر سریع از متن ساده در جای دیگر */
export function Heading({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-black text-ink">{plainText(children)}</h2>;
}
