/* ============================================================
   مرکز داده ویدیوهای آپارات دکتر حامد کرمانی
   منبع: کانال‌های رسمی (dr.hamedkermani.omfs + آرشیو)
   ⚠️ این فایل نباید از lib/data یا schema ایمپورت کند (چرخه وارداتی)
   — data.ts این فایل را ایمپورت می‌کند تا اسکیمای VideoObject
   هوم‌پیج خودکار پر شود (schema.tsx ← videoLd)
   ============================================================ */

export interface SiteVideo {
  /** هش آپارات — همچنین کلید یکتای اسکیما */
  id: string;
  title: string;
  description: string;
  /** بندانگشتی لوکال (public/aparat) — بدون وابستگی به CDN */
  thumb: string;
  /** تاریخ انتشار میلادی ISO برای اسکیمای VideoObject */
  upload: string;
  /** آدرس فریم پخش آپارات */
  embed: string;
  /** مدت نمایشی فارسی */
  duration: string;
  /** مدت استاندارد ISO 8601 برای اسکیمای VideoObject و ویدیو-سایت‌مپ */
  durationIso: string;
  cat: "orthognathic" | "implant" | "intro";
}

/** سازنده آدرس استاندارد فریم پخش آپارات */
export function aparatEmbed(uid: string): string {
  return `https://www.aparat.com/video/video/embed/videohash/${uid}/vt/frame`;
}

/** کانال آپارات دکتر — برای لینک «ویدیوهای بیشتر» */
export const APARAT_CHANNEL = "https://www.aparat.com/dr.hamedkermani.omfs";

/* ویدیوهای واقعی اضافه‌شده به ترتیب اهمیت (قبل/بعد اول) —
   توضیحات دقیقاً از محتوای ویدیو و عنوان اصلی کانال؛ بدون ادعای اضافی */
export const SITE_VIDEOS: SiteVideo[] = [
  {
    id: "p77oq71",
    title: "قبل و بعد از جراحی دو فک و چانه (ارتوسرجری)",
    description:
      "نتیجه واقعی یک بیمار پیش و بعد از جراحی دو فک (بایمکس) همراه با جنیوپلاستی چانه؛ اصلاح پروفایل و تناسب اجزای صورت پس از دوره درمان ارتودنسی و جراحی.",
    thumb: "/aparat/aparat-p77oq71.jpg",
    upload: "2022-09-25",
    embed: aparatEmbed("p77oq71"),
    duration: "۰:۱۰",
    durationIso: "PT10S",
    cat: "orthognathic",
  },
  {
    id: "X04Y6",
    title: "جراحی دو فک و چانه",
    description:
      "تصاویر واقعی اتاق عمل از جراحی دو فک (بایمکس) همراه با جنیوپلاستی؛ اصلاح موقعیت اسکلتی فک بالا و پایین زیر بیهوشی عمومی.",
    thumb: "/aparat/aparat-X04Y6.jpg",
    upload: "2022-09-23",
    embed: aparatEmbed("X04Y6"),
    duration: "۰:۲۳",
    durationIso: "PT23S",
    cat: "orthognathic",
  },
  {
    id: "i486x63",
    title: "جراحی یک فک و چانه",
    description:
      "جراحی یک فک همراه با جنیوپلاستی چانه؛ اصلاح عقب‌رفتگی فک و بهبود پروفایل در یک جلسه جراحی.",
    thumb: "/aparat/aparat-i486x63.jpg",
    upload: "2022-09-23",
    embed: aparatEmbed("i486x63"),
    duration: "۰:۰۶",
    durationIso: "PT6S",
    cat: "orthognathic",
  },
  {
    id: "40hon",
    title: "Ridge Splitting از نگاه دکتر حامد کرمانی",
    description:
      "تکنیک ریج اسپلیتینگ برای پهن‌سازی بستر استخوانی پیش از کاشت ایمپلنت دندانی؛ کاربرد این روش برای بیماران با کمبود عرض استخوان فک.",
    thumb: "/aparat/aparat-40hon.jpg",
    upload: "2023-08-09",
    embed: aparatEmbed("40hon"),
    duration: "۱:۰۱",
    durationIso: "PT61S",
    cat: "implant",
  },
  {
    id: "dEIsD",
    title: "Fresh Socket Implant از نگاه دکتر حامد کرمانی",
    description:
      "ایمپلنت فوری (Fresh Socket) در همان جلسه کشیدن دندان؛ شرایط لازم برای ایمپلنت فوری و مزیت کاهش مراحل درمان.",
    thumb: "/aparat/aparat-dEIsD.jpg",
    upload: "2023-08-09",
    embed: aparatEmbed("dEIsD"),
    duration: "۰:۴۶",
    durationIso: "PT46S",
    cat: "implant",
  },
  {
    id: "eYJyT",
    title: "سینوس لیفت و درمان سپتوم سینوس",
    description:
      "درمان سپتوم سینوس در حین جراحی سینوس لیفت برای آماده‌سازی استخوان فک بالا پیش از کاشت ایمپلنت؛ کیس کامل از اتاق عمل.",
    thumb: "/aparat/aparat-eYJyT.jpg",
    upload: "2021-11-06",
    embed: aparatEmbed("eYJyT"),
    duration: "۵:۵۳",
    durationIso: "PT353S",
    cat: "implant",
  },
  {
    id: "PyjL5",
    title: "معرفی دکتر حامد کرمانی — متخصص جراحی دهان، فک و صورت",
    description:
      "معرفی تخصص، خدمات و مسیر درمان در مطب دکتر حامد کرمانی، متخصص جراحی فک و صورت در تهران؛ از مشاوره اولیه تا پیگیری پس از جراحی.",
    thumb: "/aparat/aparat-PyjL5.jpg",
    upload: "2023-10-18",
    embed: aparatEmbed("PyjL5"),
    duration: "۰:۵۸",
    durationIso: "PT58S",
    cat: "intro",
  },
];

function byId(id: string): SiteVideo {
  const v = SITE_VIDEOS.find((x) => x.id === id);
  if (!v) throw new Error(`ویدیوی ناشناخته: ${id}`);
  return v;
}

/* نگاشت صفحه فرود → ویدیوهای مرتبط (فقط ویدیوی مرتبط با موضوع صفحه؛
   ویدیوی بی‌ربط = تجربه کاربری بد و سیگنال موضوعی ضعیف) */
const PAGE_VIDEO_IDS: Record<string, string[]> = {
  "jaw-surgery": ["p77oq71", "X04Y6", "i486x63"],
  "best-jaw-surgeon-tehran": ["p77oq71", "X04Y6", "i486x63"],
  "chin-surgery": ["i486x63", "p77oq71"],
  "dental-implant": ["40hon", "dEIsD", "eYJyT"],
  "implant-pasdaran": ["40hon", "dEIsD", "eYJyT"],
};

export function videosForPage(slug: string): SiteVideo[] {
  return (PAGE_VIDEO_IDS[slug] ?? []).map(byId);
}

/** ویدیوی معرفی — صفحه درباره */
export const INTRO_VIDEO: SiteVideo = byId("PyjL5");

/** سه ویدیوی نمونه برای بخش ویدیوی گالری/هوم — قبل و بعد اولویت دارد */
export const HIGHLIGHT_VIDEOS: SiteVideo[] = ["p77oq71", "X04Y6", "40hon"].map(byId);
