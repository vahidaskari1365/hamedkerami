"use client";

/* ============================================================
   ArticleBody — رندر بدنه مقاله (مارک‌داون با استایل اختصاصی سایت)
   بلاک‌کوت ابتدایی = باکس «پاسخ کوتاه» برای موتورهای پاسخ‌محور (AEO)
   در صفحه وبلاگ و صفحه اختصاصی هر مقاله استفاده می‌شود.
   ============================================================ */

import ReactMarkdown from "react-markdown";

export function ArticleBody({ body }: { body: string }) {
  return (
    <div className="article-md">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mt-5 text-[15px] leading-8 text-foreground/75 sm:text-base sm:leading-9">
              {children}
            </p>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 flex items-start gap-3 text-lg font-black leading-8 text-ink sm:text-xl">
              <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-teal" aria-hidden />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-7 text-base font-black text-ink/85 sm:text-lg">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="mt-5 space-y-2.5">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2.5 text-[15px] leading-8 text-foreground/75">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-teal/70" aria-hidden />
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
            <div className="mt-2 rounded-2xl border-r-4 border-teal bg-teal/8 p-5 sm:p-6">
              <p className="text-sm font-bold text-teal-3">پاسخ کوتاه</p>
              <div className="[&>*:first-child]:mt-2 text-[15px] leading-8 text-foreground/85">{children}</div>
            </div>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
