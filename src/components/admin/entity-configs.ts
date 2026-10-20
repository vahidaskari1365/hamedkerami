/* ============================================================
   کانفیگ فرم‌های پنل ادمین — سمت کلاینت
   ============================================================ */

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "lines" | "number" | "image" | "bool" | "select" | "markdown";
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  wide?: boolean; // تمام عرض در فرم
}

export interface EntityConfig {
  slug: string;
  title: string;
  singular: string;
  titleKey: string;
  subtitleKey?: string;
  imageKey?: string;
  badgeKey?: string;
  publishedKey?: string;
  hasOrder?: boolean;
  readOnly?: boolean;
  fields: FieldDef[];
}

const CATS = [
  "ارتوسرجری",
  "جنیوپلاستی",
  "ایمپلنت",
  "جراحی های داخل دهان",
  "قبل و بعد",
  "کلینیک و اتاق عمل",
];

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  services: {
    slug: "services",
    title: "خدمات",
    singular: "خدمت",
    titleKey: "title",
    subtitleKey: "latin",
    imageKey: "image",
    publishedKey: "published",
    hasOrder: true,
    fields: [
      { key: "title", label: "عنوان", type: "text", placeholder: "جراحی دو فک" },
      { key: "slug", label: "شناسه (انگلیسی)", type: "text", placeholder: "bimax" },
      { key: "latin", label: "عنوان لاتین", type: "text", placeholder: "Bimaxillary Surgery" },
      { key: "image", label: "تصویر", type: "image", wide: true },
      { key: "desc", label: "توضیحات", type: "textarea", wide: true },
      { key: "points", label: "بولت‌پوینت‌ها (هر خط یک مورد)", type: "lines", wide: true },
      { key: "order", label: "ترتیب نمایش", type: "number" },
      { key: "published", label: "نمایش در سایت", type: "bool" },
    ],
  },
  costs: {
    slug: "costs",
    title: "تعرفه و قیمت‌ها",
    singular: "قیمت",
    titleKey: "item",
    subtitleKey: "price",
    badgeKey: "category",
    hasOrder: true,
    fields: [
      {
        key: "category",
        label: "دسته",
        type: "select",
        options: [
          { value: "jaw", label: "جراحی فک" },
          { value: "implant", label: "ایمپلنت" },
        ],
      },
      { key: "item", label: "نام خدمت", type: "text", placeholder: "جراحی دو فک (بایمکس)" },
      { key: "price", label: "قیمت", type: "text", placeholder: "۱۹۰ تا ۲۰۰ میلیون تومان" },
      { key: "order", label: "ترتیب", type: "number" },
    ],
  },
  covers: {
    slug: "covers",
    title: "کاور نمونه کارها (حلقه چرخان)",
    singular: "کاور",
    titleKey: "title",
    imageKey: "src",
    hasOrder: true,
    fields: [
      { key: "src", label: "تصویر (ترجیحاً عمودی ۹:۱۶)", type: "image", wide: true },
      { key: "title", label: "عنوان", type: "text" },
      { key: "order", label: "ترتیب در حلقه", type: "number" },
    ],
  },
  cases: {
    slug: "cases",
    title: "گالری نمونه‌ها",
    singular: "نمونه گالری",
    titleKey: "title",
    subtitleKey: "cat",
    imageKey: "src",
    hasOrder: true,
    fields: [
      { key: "src", label: "تصویر", type: "image", wide: true },
      { key: "title", label: "عنوان", type: "text" },
      {
        key: "cat",
        label: "دسته",
        type: "select",
        options: CATS.map((c) => ({ value: c, label: c })),
      },
      { key: "order", label: "ترتیب", type: "number" },
    ],
  },
  beforeafter: {
    slug: "beforeafter",
    title: "اسلایدر قبل و بعد",
    singular: "جفت قبل/بعد",
    titleKey: "label",
    badgeKey: "key",
    fields: [
      {
        key: "key",
        label: "موقعیت در سایت",
        type: "select",
        options: [
          { value: "main", label: "صفحه اصلی" },
          { value: "bimax", label: "گالری — بایمکس" },
          { value: "blepharo", label: "گالری — بلفاروپلاستی" },
        ],
      },
      { key: "before", label: "تصویر قبل", type: "image", wide: true },
      { key: "after", label: "تصویر بعد", type: "image", wide: true },
      { key: "label", label: "برچسب", type: "text" },
    ],
  },
  blog: {
    slug: "blog",
    title: "بلاگ",
    singular: "مقاله",
    titleKey: "title",
    subtitleKey: "date",
    imageKey: "cover",
    publishedKey: "published",
    fields: [
      { key: "title", label: "عنوان مقاله", type: "text", wide: true },
      { key: "slug", label: "شناسه URL (انگلیسی)", type: "text", placeholder: "wisdom-teeth" },
      { key: "date", label: "تاریخ نمایشی", type: "text", placeholder: "۱۲ مهر ۱۴۰۳" },
      { key: "cover", label: "تصویر شاخص", type: "image", wide: true },
      { key: "excerpt", label: "خلاصه", type: "textarea", wide: true },
      {
        key: "body",
        label: "متن کامل مقاله",
        type: "markdown",
        wide: true,
        hint: "مارک‌داون — عکس با دکمه‌ی «درج عکس در متن»",
      },
      { key: "published", label: "منتشر شده", type: "bool" },
    ],
  },
  certificates: {
    slug: "certificates",
    title: "مدارک و گواهینامه‌ها",
    singular: "مدرک",
    titleKey: "title",
    imageKey: "src",
    hasOrder: true,
    fields: [
      { key: "src", label: "تصویر مدرک", type: "image", wide: true },
      { key: "title", label: "عنوان", type: "text", wide: true },
      { key: "order", label: "ترتیب", type: "number" },
    ],
  },
  team: {
    slug: "team",
    title: "تیم",
    singular: "عضو تیم",
    titleKey: "name",
    subtitleKey: "role",
    imageKey: "image",
    hasOrder: true,
    fields: [
      { key: "name", label: "نام", type: "text" },
      { key: "role", label: "سمت", type: "text" },
      { key: "image", label: "تصویر", type: "image", wide: true },
      { key: "order", label: "ترتیب", type: "number" },
    ],
  },
  education: {
    slug: "education",
    title: "تحصیلات",
    singular: "مورد تحصیلی",
    titleKey: "title",
    subtitleKey: "place",
    hasOrder: true,
    fields: [
      { key: "year", label: "سال", type: "text", placeholder: "۱۳۹۷" },
      { key: "title", label: "عنوان", type: "text", wide: true },
      { key: "place", label: "دانشگاه / محل", type: "text", wide: true },
      { key: "order", label: "ترتیب", type: "number" },
    ],
  },
  stats: {
    slug: "stats",
    title: "آمار نوار بالای سایت",
    singular: "آماره",
    titleKey: "label",
    hasOrder: true,
    fields: [
      { key: "label", label: "برچسب", type: "text", placeholder: "جراحی فک و صورت" },
      { key: "value", label: "عدد", type: "number", placeholder: "1067" },
      { key: "suffix", label: "پسوند", type: "text", placeholder: "+" },
      { key: "order", label: "ترتیب", type: "number" },
    ],
  },
  successrates: {
    slug: "successrates",
    title: "نرخ موفقیت‌ها",
    singular: "نرخ موفقیت",
    titleKey: "title",
    subtitleKey: "detail",
    hasOrder: true,
    fields: [
      { key: "rate", label: "درصد", type: "text", placeholder: "۹۳٪" },
      { key: "title", label: "عنوان", type: "text", wide: true },
      { key: "detail", label: "توضیح", type: "text", wide: true },
      { key: "order", label: "ترتیب", type: "number" },
    ],
  },
  extras: {
    slug: "extras",
    title: "خدمات تکمیلی (نوار متحرک)",
    singular: "خدمت تکمیلی",
    titleKey: "title",
    subtitleKey: "desc",
    hasOrder: true,
    fields: [
      { key: "title", label: "عنوان", type: "text" },
      { key: "desc", label: "توضیح کوتاه", type: "text" },
      { key: "order", label: "ترتیب", type: "number" },
    ],
  },
  faq: {
    slug: "faq",
    title: "سوالات متداول",
    singular: "سوال",
    titleKey: "q",
    hasOrder: true,
    fields: [
      { key: "q", label: "سوال", type: "text", wide: true },
      { key: "a", label: "پاسخ", type: "textarea", wide: true },
      { key: "order", label: "ترتیب", type: "number" },
    ],
  },
  hours: {
    slug: "hours",
    title: "ساعات کاری مطب",
    singular: "ساعت کاری",
    titleKey: "day",
    subtitleKey: "time",
    hasOrder: true,
    fields: [
      { key: "day", label: "روز", type: "text", placeholder: "یکشنبه" },
      { key: "doctor", label: "پزشک", type: "text" },
      { key: "time", label: "ساعت", type: "text", placeholder: "۱۵:۰۰ تا ۱۹:۰۰" },
      { key: "order", label: "ترتیب", type: "number" },
    ],
  },
};

export const ADMIN_NAV: {
  group: string;
  items: { path: string; label: string; icon: string }[];
}[] = [
  {
    group: "",
    items: [{ path: "/admin", label: "داشبورد و آمار", icon: "LayoutDashboard" }],
  },
  {
    group: "محتوای صفحات",
    items: [
      { path: "/admin/services", label: "خدمات", icon: "Stethoscope" },
      { path: "/admin/costs", label: "تعرفه و قیمت‌ها", icon: "BadgeDollarSign" },
      { path: "/admin/covers", label: "کاور نمونه کارها", icon: "Orbit" },
      { path: "/admin/cases", label: "گالری نمونه‌ها", icon: "Images" },
      { path: "/admin/beforeafter", label: "قبل و بعد", icon: "FlipHorizontal2" },
      { path: "/admin/blog", label: "بلاگ", icon: "Newspaper" },
    ],
  },
  {
    group: "صفحات فرود سئو",
    items: [
      { path: "/admin/landing", label: "صفحات فرود (۴ صفحه)", icon: "Globe" },
    ],
  },
  {
    group: "درباره دکتر",
    items: [
      { path: "/admin/education", label: "تحصیلات", icon: "GraduationCap" },
      { path: "/admin/certificates", label: "مدارک", icon: "Award" },
      { path: "/admin/team", label: "تیم", icon: "Users" },
      { path: "/admin/stats", label: "آمار صفحه اصلی", icon: "BarChart3" },
      { path: "/admin/successrates", label: "نرخ موفقیت", icon: "TrendingUp" },
      { path: "/admin/extras", label: "خدمات تکمیلی", icon: "Sparkles" },
    ],
  },
  {
    group: "اطلاعات عمومی",
    items: [
      { path: "/admin/faq", label: "سوالات متداول", icon: "HelpCircle" },
      { path: "/admin/hours", label: "ساعات کاری", icon: "Clock" },
    ],
  },
  {
    group: "بیماران و تعامل",
    items: [
      { path: "/admin/appointments", label: "نوبت‌های آنلاین", icon: "CalendarClock" },
      { path: "/admin/comments", label: "نظرات مقاله‌ها", icon: "MessagesSquare" },
    ],
  },
  {
    group: "سیستم",
    items: [
      { path: "/admin/media", label: "کتابخانه رسانه", icon: "ImagePlus" },
      { path: "/admin/messages", label: "پیام‌های تماس", icon: "Mail" },
      { path: "/admin/settings", label: "تنظیمات و متن‌ها", icon: "Settings" },
    ],
  },
];
