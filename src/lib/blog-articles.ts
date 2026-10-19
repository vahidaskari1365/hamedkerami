/* ============================================================
   مقالات وبلاگ — آگریگیتور
   هر مقاله در فایل مستقل خودش زیر src/lib/articles/ است تا
   نگهداری، بازنویسی و QA یکی-یکی ساده باشد.
   قوانین ثابت هر مقاله (docs/seo/keyword-plan.md + دستور کاربر):
   - ۱۵۰۰+ کلمه، جملات ۱۰۰٪ یکتا (نه تکرار داخلی، نه کپی منابع)
   - پاسخ مستقیم ابتدای مقاله، اعداد داخل جمله
   - FAQ با حداقل ۴ سوال + CTA تماس ۰۲۱-۶۶۹۲۱۵۰۰
   - لینک داخلی به صفحه BOFU؛ نام دکتر کرمانی/فلوشیپ کرانیوفاسیال
   - اسکیمای مقاله در app/blog/[slug] رندر می شود
   ============================================================ */

import { ARTICLE_BEFORE_AFTER } from "./articles/jaw-surgery-before-after";
import { ARTICLE_COMPLICATIONS } from "./articles/jaw-surgery-complications";
import { ARTICLE_RECOVERY } from "./articles/jaw-surgery-recovery-care";
import { ARTICLE_ASYMMETRY } from "./articles/jaw-asymmetry";
import { ARTICLE_BEST_SURGEON } from "./articles/best-jaw-surgeon-tehran";
import { ARTICLE_GUMMY_SMILE } from "./articles/gummy-smile-treatment";
import type { BlogArticleSeed } from "./articles/types";

export type { BlogArticleSeed } from "./articles/types";

export const BLOG_ARTICLES: BlogArticleSeed[] = [
  ARTICLE_BEFORE_AFTER,
  ARTICLE_COMPLICATIONS,
  ARTICLE_RECOVERY,
  ARTICLE_ASYMMETRY,
  ARTICLE_BEST_SURGEON,
  ARTICLE_GUMMY_SMILE,
];
