/* ============================================================
   KeywordTags — برچسب‌های کلیدواژه قابل‌مشاهده پایین مقاله
   ------------------------------------------------------------
   چرا: کلیدواژه‌های هدف تاکنون فقط در اسکیمای JSON-LD
   (BlogPosting.keywords) بودند که برای کاربر نامرئی است.
   گوگل هم‌راستایی محتوای مرئی با اسکیما را می‌سنجد؛ این بخش
   همان کلیدواژه‌های seo-keywords را به‌صورت برچسب نمایش می‌دهد
   (بدون لینک — صفحه‌های خالی برچسب ساخته نمی‌شود).
   منبع یکتا: keywordsForSlug(slug) — همان منبع اسکیما؛
   برچسب اول = کلمه کانونی مقاله (H1 همان).
   ============================================================ */

export function KeywordTags({
  keywords,
  heading = "کلیدواژه‌ها",
}: {
  keywords: string;
  heading?: string;
}) {
  const list = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 8);
  if (!list.length) return null;
  return (
    <section
      aria-label={heading}
      className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/6"
    >
      <h2 className="text-sm font-black text-ink">{heading}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {list.map((k, i) => (
          <li
            key={k}
            className={
              i === 0
                ? "rounded-full bg-teal/15 px-4 py-1.5 text-xs font-bold text-teal-3"
                : "rounded-full bg-ink/5 px-4 py-1.5 text-xs text-foreground/70"
            }
          >
            {k}
          </li>
        ))}
      </ul>
      {list.length > 1 ? (
        <p className="mt-3 text-[11px] leading-5 text-foreground/45">
          کلمه کانونی این مقاله «{list[0]}» است؛ سایر عبارات، کلیدواژه‌های مکمل
          همان موضوع‌اند.
        </p>
      ) : null}
    </section>
  );
}
