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
   - کاور 3D اختصاصی هر مقاله: /images/blog/3d-<slug>.jpg
   ترتیب: جدیدترین اول (نمایش در فهرست وبلاگ بر اساس همین آرایه
   هنگام fallback و ترتیب seed اولیه)
   ============================================================ */

import { ARTICLE_FACIAL_CONTOURING } from "./articles/facial-contouring";
import { ARTICLE_VLINE } from "./articles/v-line-jaw-reduction";
import { ARTICLE_JAW_BOTOX } from "./articles/jaw-botox-masseter";
import { ARTICLE_GENIOPLASTY_COST } from "./articles/genioplasty-cost";
import { ARTICLE_TMD } from "./articles/tmj-pain-treatment";
import { ARTICLE_JAW_AGE } from "./articles/jaw-surgery-age";
import { ARTICLE_MAXFAC_VS_PLASTIC } from "./articles/maxillofacial-vs-plastic-surgeon";
import { ARTICLE_ORTHO_JAW } from "./articles/jaw-surgery-orthodontics";
import { ARTICLE_FILLER_VS_SURGERY } from "./articles/jaw-filler-vs-surgery";
import { ARTICLE_CLEFT } from "./articles/cleft-lip-palate-surgery";
import { ARTICLE_MMA } from "./articles/sleep-apnea-mma-surgery";
import { ARTICLE_FRACTURE } from "./articles/jaw-fracture-surgery";
import { ARTICLE_BEFORE_AFTER } from "./articles/jaw-surgery-before-after";
import { ARTICLE_COMPLICATIONS } from "./articles/jaw-surgery-complications";
import { ARTICLE_RECOVERY } from "./articles/jaw-surgery-recovery-care";
import { ARTICLE_ASYMMETRY } from "./articles/jaw-asymmetry";
import { ARTICLE_BEST_SURGEON } from "./articles/best-jaw-surgeon-tehran";
import { ARTICLE_GUMMY_SMILE } from "./articles/gummy-smile-treatment";
import type { BlogArticleSeed } from "./articles/types";

export type { BlogArticleSeed } from "./articles/types";

export const BLOG_ARTICLES: BlogArticleSeed[] = [
  ARTICLE_FACIAL_CONTOURING,
  ARTICLE_VLINE,
  ARTICLE_JAW_BOTOX,
  ARTICLE_GENIOPLASTY_COST,
  ARTICLE_TMD,
  ARTICLE_JAW_AGE,
  ARTICLE_MAXFAC_VS_PLASTIC,
  ARTICLE_ORTHO_JAW,
  ARTICLE_FILLER_VS_SURGERY,
  ARTICLE_CLEFT,
  ARTICLE_MMA,
  ARTICLE_FRACTURE,
  ARTICLE_BEFORE_AFTER,
  ARTICLE_COMPLICATIONS,
  ARTICLE_RECOVERY,
  ARTICLE_ASYMMETRY,
  ARTICLE_BEST_SURGEON,
  ARTICLE_GUMMY_SMILE,
];
