/* ============================================================
   رجیستری موجودیت‌های قابل مدیریت از پنل ادمین
   هر ورودی: نام مدل پرisma + فیلدهای مجاز + نوع داده + ترتیب لیست
   ============================================================ */

export type FieldType = "string" | "int" | "bool" | "json" | "category";

export interface EntityDef {
  model: string; // نام delegate در Prisma Client
  fields: Record<string, FieldType>;
  orderBy: Record<string, "asc" | "desc">;
  required: string[]; // فیلدهای اجباری در ایجاد
  publicFilter?: Record<string, unknown>; // فیلتر در API عمومی
}

export const ADMIN_ENTITIES: Record<string, EntityDef> = {
  services: {
    model: "service",
    fields: {
      slug: "string",
      title: "string",
      latin: "string",
      desc: "string",
      image: "string",
      points: "json",
      order: "int",
      published: "bool",
    },
    orderBy: { order: "asc" },
    required: ["title"],
  },
  extras: {
    model: "serviceExtra",
    fields: { title: "string", desc: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["title"],
  },
  education: {
    model: "education",
    fields: { year: "string", title: "string", place: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["title"],
  },
  team: {
    model: "teamMember",
    fields: { name: "string", role: "string", image: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["name"],
  },
  stats: {
    model: "stat",
    fields: { value: "int", label: "string", suffix: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["label"],
  },
  successrates: {
    model: "successRate",
    fields: { rate: "string", title: "string", detail: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["title"],
  },
  costs: {
    model: "costItem",
    fields: { category: "category", item: "string", price: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["item", "price"],
  },
  blog: {
    model: "blogPost",
    fields: {
      slug: "string",
      title: "string",
      excerpt: "string",
      body: "string",
      cover: "string",
      date: "string",
      published: "bool",
    },
    orderBy: { createdAt: "desc" },
    required: ["title", "slug"],
    publicFilter: { published: true },
  },
  cases: {
    model: "galleryCase",
    fields: { src: "string", cat: "string", title: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["src"],
  },
  covers: {
    model: "portfolioCover",
    fields: { src: "string", title: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["src"],
  },
  certificates: {
    model: "certificate",
    fields: { src: "string", title: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["src"],
  },
  faq: {
    model: "faq",
    fields: { q: "string", a: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["q"],
  },
  hours: {
    model: "hour",
    fields: { day: "string", doctor: "string", time: "string", order: "int" },
    orderBy: { order: "asc" },
    required: ["day"],
  },
  beforeafter: {
    model: "beforeAfterPair",
    fields: { key: "category", before: "string", after: "string", label: "string" },
    orderBy: { key: "asc" },
    required: ["key", "before", "after"],
  },
  messages: {
    model: "contactMessage",
    fields: {},
    orderBy: { createdAt: "desc" },
    required: [],
  },
  /* نوبت‌ها و نظرات فقط از صفحه‌های اختصاصی خودشان مدیریت می‌شوند؛
     این تعریف فقط PUT (تغییر وضعیت/تأیید) و DELETE و GET را از
     API عمومی ادمین فعال می‌کند */
  appointments: {
    model: "appointment",
    fields: { status: "string" },
    orderBy: { createdAt: "desc" },
    required: [],
  },
  comments: {
    model: "articleComment",
    /* slug/name/body: برای ثبت بازخورد واقعی بیماران (اسلاگ اختصاصی
       patient-reviews) توسط تیم مطب در پنل — علاوه بر بازبینی ورودی‌ها */
    fields: { approved: "bool", slug: "string", name: "string", body: "string" },
    orderBy: { createdAt: "desc" },
    required: [],
  },
};

/** تبدیل و پالایش بدنه درخواست به داده‌ی معتبر برای Prisma */
export function sanitizeBody(
  def: EntityDef,
  body: Record<string, unknown>,
  { partial }: { partial: boolean }
): { data: Record<string, unknown>; errors: string[] } {
  const data: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const [field, type] of Object.entries(def.fields)) {
    const has = Object.prototype.hasOwnProperty.call(body, field);
    if (!has) {
      if (!partial && def.required.includes(field)) {
        errors.push(`فیلد «${field}» الزامی است`);
      }
      continue;
    }
    const raw = body[field];
    switch (type) {
      case "string":
      case "category":
        if (typeof raw !== "string") {
          errors.push(`فیلد «${field}» باید متن باشد`);
          continue;
        }
        data[field] = raw.slice(0, type === "category" ? 40 : 6000);
        break;
      case "int": {
        const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
        if (Number.isNaN(n)) {
          errors.push(`فیلد «${field}» باید عدد باشد`);
          continue;
        }
        data[field] = Math.max(-999999, Math.min(999999, Math.trunc(n)));
        break;
      }
      case "bool":
        data[field] = Boolean(raw);
        break;
      case "json": {
        // آرایه‌ی رشته‌ای (بولت‌پوینت‌ها) — ورودی: آرایه یا متن چندخطی
        let arr: unknown[] = [];
        if (Array.isArray(raw)) arr = raw;
        else if (typeof raw === "string")
          arr = raw
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
        data[field] = JSON.stringify(
          arr.map((x) => String(x).slice(0, 300)).slice(0, 20)
        );
        break;
      }
    }
    if (
      def.required.includes(field) &&
      typeof data[field] === "string" &&
      !(data[field] as string).trim()
    ) {
      errors.push(`فیلد «${field}» الزامی است`);
    }
  }
  return { data, errors };
}
