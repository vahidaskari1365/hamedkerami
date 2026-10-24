import { db } from "@/lib/db";

/* ============================================================
   گارد اسکیمای نوبت‌دهی — میگرشن خودکار و مصرف‌پذیر (idempotent)
   هاست اشتراکی cPanel ترمینال ندارد و در دیپلوی «db push» اجرا
   نمی‌شود؛ پس تغییرات افزودنیِ اسکیما در اولین فراخوانی API نوبت
   روی همان فایل custom.db پروداکشن اعمال می‌شود (CREATE/ALTER امن).
   در لوکال/بیلد تازه که init.db جدید دارد، همه‌ی دستورات no-op است.
   ============================================================ */

let ensured: Promise<void> | null = null;

/** یک‌بار در هر پروسه اجرا می‌شود؛ فراخوانی‌های بعدی بدون هزینه */
export function ensureBookingSchema(): Promise<void> {
  ensured ??= runPatch().catch((e) => {
    /* خطا → کش باطل تا درخواست بعدی دوباره تلاش کند */
    ensured = null;
    throw e;
  });
  return ensured;
}

/* جدول‌های تازه — با همه‌ی ستون‌ها (برای دیتابیس کاملاً خام) */
const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS "OtpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mobile" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "consumedAt" DATETIME,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "ip" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "BookingNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL DEFAULT '',
    "kind" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "error" TEXT NOT NULL DEFAULT '',
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL
  )`,
  /* نسخه کامل Appointment — اگر از صفر ساخته شود همه ستون‌ها را دارد */
  `CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "doctor" TEXT NOT NULL,
    "dayIso" TEXT NOT NULL,
    "dayJalali" TEXT NOT NULL,
    "slot" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "latinName" TEXT NOT NULL DEFAULT '',
    "gender" TEXT NOT NULL DEFAULT '',
    "birthYear" TEXT NOT NULL DEFAULT '',
    "visitType" TEXT NOT NULL DEFAULT 'in_person',
    "feeToman" INTEGER NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL DEFAULT 'clinic',
    "trackingCode" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL
  )`,
];

/* ستون‌های افزودنی فاز ۲ روی Appointment های قدیمی */
const NEW_COLUMNS: { table: string; column: string; ddl: string }[] = [
  { table: "Appointment", column: "latinName", ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: "Appointment", column: "gender", ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: "Appointment", column: "birthYear", ddl: "TEXT NOT NULL DEFAULT ''" },
  { table: "Appointment", column: "visitType", ddl: "TEXT NOT NULL DEFAULT 'in_person'" },
  { table: "Appointment", column: "feeToman", ddl: "INTEGER NOT NULL DEFAULT 0" },
  { table: "Appointment", column: "paymentMethod", ddl: "TEXT NOT NULL DEFAULT 'clinic'" },
  { table: "Appointment", column: "trackingCode", ddl: "TEXT NOT NULL DEFAULT ''" },
];

/* ایندکس‌ها — نام‌گذاری مطابق قرارداد Prisma تا با db push هم‌خوان بماند */
const INDEXES = [
  `CREATE INDEX IF NOT EXISTS "Appointment_dayIso_idx" ON "Appointment"("dayIso")`,
  `CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "Appointment"("status")`,
  `CREATE INDEX IF NOT EXISTS "Appointment_createdAt_idx" ON "Appointment"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Appointment_phone_idx" ON "Appointment"("phone")`,
  `CREATE INDEX IF NOT EXISTS "Appointment_trackingCode_idx" ON "Appointment"("trackingCode")`,
  `CREATE INDEX IF NOT EXISTS "OtpCode_mobile_idx" ON "OtpCode"("mobile")`,
  `CREATE INDEX IF NOT EXISTS "OtpCode_createdAt_idx" ON "OtpCode"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "BookingNotification_status_idx" ON "BookingNotification"("status")`,
  `CREATE INDEX IF NOT EXISTS "BookingNotification_bookingId_idx" ON "BookingNotification"("bookingId")`,
];

async function runPatch(): Promise<void> {
  for (const sql of CREATE_TABLES) {
    await db.$executeRawUnsafe(sql);
  }
  for (const { table, column, ddl } of NEW_COLUMNS) {
    const cols = await db.$queryRawUnsafe<{ name: string }[]>(
      `PRAGMA table_info('${table}')`,
    );
    if (!cols.some((c) => c.name === column)) {
      await db.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${ddl}`);
    }
  }
  for (const sql of INDEXES) {
    await db.$executeRawUnsafe(sql);
  }
  console.log("[booking-schema] اسکیمای نوبت‌دهی آماده است (patch idempotent)");
}
