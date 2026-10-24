/* ============================================================
   نقطه‌ی ورود اپ روی cPanel (Setup Node.js App / Passenger)
   Application startup file = server.js

   کارها:
   ۱) اگر پکیج دیپلوی جدید (deploy-package.tar.gz) موجود باشد:
      اکسترکت در پوشه staging → تأیید سلامت → تعویض اتمیک.
      ⚠️ نکته حیاتی: tar معمولی فقط overwrite می‌کند و فایل‌های
      جامانده از بیلدهای قدیمی را پاک نمی‌کند؛ نتیجه‌اش state
      مخلوط بود — مثلاً باندل قدیمی sitemap.xml از هفته اول
      پروژه زنده ماند و هرگز به‌روز نشد. راه‌حل: کل .next هر
      بار کامل تعویض می‌شود، نه merge.
   ۲) chdir به ریشه اپ — تا دیتابیس (db/) و آپلودها (data/uploads)
      همیشه در مسیر پایدار و خارج از بیلد باشند
   ۳) تنظیم متغیرهای محیطی پروداکشن (DATABASE_URL و…)
   ۴) اجرای سرور standalone ساخته‌شده توسط `next build`
   ============================================================ */

/* eslint-disable @typescript-eslint/no-require-imports -- فایل ورودی Passenger باید CommonJS بماند */
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = __dirname;

/* Passenger ممکن است cwd را جای دیگری بگذارد — قطعی می‌کنیم */
process.chdir(ROOT);

/* ============================================================
   بخش ۱ — دیپلوی خودکار: اکسترکت پکیج در انتظار با تعویض تمیز
   ============================================================ */

const PKG = path.join(ROOT, "deploy-package.tar.gz");
const STAGE = path.join(ROOT, ".deploy-staging-" + process.pid);

/** حذف زباله‌های swap ناتمام بوت‌های قبلی (اگر پروسه وسط کار مرده باشد) */
function cleanupSwapJunk() {
  try {
    for (const name of fs.readdirSync(ROOT)) {
      if (/^\.deploy-staging-/.test(name) || /^\.next\.old-/.test(name) || /^\.prisma\.old-/.test(name)) {
        console.log("[bootstrap] removing leftover from interrupted swap:", name);
        fs.rmSync(path.join(ROOT, name), { recursive: true, force: true });
      }
    }
  } catch { /* noop */ }
}

/**
 * تعویض یک پوشه داخل ROOT با نسخه staging — با rollback.
 * rename روی یک فایل‌سیستم اتمیک است؛ هیچ لحظه‌ای .next ناقص روی مسیر اصلی نیست.
 */
function swapDir(stageDir, name) {
  const src = path.join(stageDir, name);
  if (!fs.existsSync(src)) return; // پکیج این پوشه را ندارد — دست نمی‌زنیم
  const cur = path.join(ROOT, name);
  const trash = path.join(ROOT, "." + name.replace(/\//g, "_") + ".old-" + process.pid);
  if (fs.existsSync(cur)) fs.renameSync(cur, trash);
  try {
    fs.renameSync(src, cur);
  } catch (e) {
    /* rollback — نسخه قبلی را برگردان تا سایت با بیلد قدیمی بالا بیاید */
    if (fs.existsSync(trash)) fs.renameSync(trash, cur);
    throw e;
  }
  fs.rmSync(trash, { recursive: true, force: true });
}

function extractPendingPackage() {
  if (!fs.existsSync(PKG)) return;

  console.log("[bootstrap] deploy package found — clean-swap extract starting…");
  try {
    /* ۱) اکسترکت در staging — هیچ‌وقت مستقیم روی build زنده نه */
    fs.rmSync(STAGE, { recursive: true, force: true });
    fs.mkdirSync(STAGE, { recursive: true });
    execFileSync("tar", ["-xzf", PKG, "-C", STAGE], { stdio: "inherit" });

    /* ۲) تأیید سلامت پکیج — قبل از دست زدن به بیلد زنده */
    if (!fs.existsSync(path.join(STAGE, ".next", "standalone", "server.js"))) {
      throw new Error("package verification failed: .next/standalone/server.js missing");
    }
    console.log("[bootstrap] package verified — swapping build…");

    /* ۳) تعویض تمیز — کل .next جایگزین می‌شود تا هیچ باندل/آرتیفکت
          قدیمی از بیلدهای قبل (مثل sitemap.xml قدیمی) باقی نماند */
    swapDir(STAGE, ".next");
    swapDir(STAGE, "prisma");

    /* ۴) db/init.db — فقط این فایل؛ db/custom.db داده واقعی پروداکشن است
          (نوبت‌ها، مقالات ایجنت‌ها) و باید از سالم بماند */
    try {
      const srcInit = path.join(STAGE, "db", "init.db");
      if (fs.existsSync(srcInit)) {
        fs.mkdirSync(path.join(ROOT, "db"), { recursive: true });
        fs.copyFileSync(srcInit, path.join(ROOT, "db", "init.db"));
      }
    } catch (e) {
      console.error("[bootstrap] init.db copy (non-fatal):", e.message);
    }

    /* ۵) server.js پکیج — همین فایل است؛ روی نسخه در حال اجرا (در حافظه) اثری ندارد */
    try {
      const srcServer = path.join(STAGE, "server.js");
      if (fs.existsSync(srcServer)) fs.copyFileSync(srcServer, path.join(ROOT, "server.js"));
    } catch (e) {
      console.error("[bootstrap] server.js copy (non-fatal):", e.message);
    }

    /* ۶) کانفیگ SDK هوش مصنوعی (ایجنت‌های بلاگ) — Next standalone بعد از
       استارت process.chdir به .next/standalone می‌زند، پس SDK فایل را در
       cwd نمی‌بیند؛ کپی آن داخل .next/standalone کشف cwd-محور را تضمین می‌کند
       (هوم‌دایرکتوری هم در workflow دیپلوی پوشش داده می‌شود) */
    try {
      const cfg = path.join(ROOT, ".z-ai-config");
      const dstDir = path.join(ROOT, ".next", "standalone");
      if (fs.existsSync(cfg) && fs.existsSync(dstDir)) {
        fs.copyFileSync(cfg, path.join(dstDir, ".z-ai-config"));
        console.log("[bootstrap] .z-ai-config → .next/standalone کپی شد");
      }
    } catch (e) {
      console.error("[bootstrap] zai-config copy (non-fatal):", e.message);
    }

    fs.rmSync(STAGE, { recursive: true, force: true });
    fs.unlinkSync(PKG);
    console.log("[bootstrap] clean-swap deploy DONE — fresh .next is live");
  } catch (e) {
    console.error("[bootstrap] deploy package extract FAILED — keeping current build:", e.message);
    try { fs.rmSync(STAGE, { recursive: true, force: true }); } catch {}
    /* پکیج حذف نمی‌شود — بوت بعدی دوباره تلاش می‌کند (retry) */
  }
}

/** فایل‌های استاتیک قدیمی که نباید روی routeهای داینامیک اولویت داشته باشند */
function cleanupStalePublicArtifacts() {
  const STALE = [
    "public/robots.txt",
    "public/sitemap.xml",
    "public/llms.txt",
    "public/llms-full.txt",
  ];
  for (const f of STALE) {
    try {
      fs.unlinkSync(path.join(ROOT, f));
      console.log("[bootstrap] removed stale artifact:", f);
    } catch { /* نبود — مشکلی نیست */ }
  }
  /* فایل‌های موقتی تست‌های خیلی قدیمی */
  for (const junk of ["ci-pkg.tar.gz", "probe.txt", "ci-write-test.txt", "ci-test-1.txt", "ci-test-2.txt", "ci-test-3.txt"]) {
    try { fs.unlinkSync(path.join(ROOT, junk)); } catch {}
  }
}

cleanupSwapJunk();
extractPendingPackage();
cleanupStalePublicArtifacts();

/* ============================================================
   بخش ۱٫۵ — ضد cold-start (خودترمیم)
   Passenger به‌طور پیش‌فرض پروسهٔ بیکار را بعد از ~۵ دقیقه
   می‌کشد؛ درخواست بعدی (اغلب از Bingbot/Googlebot) کول‌استارت
   سنگین می‌خورد → تایم‌اوت → سitemap «Couldn't fetch / timed out»
   و ایندکس داغدار. راه‌حل رسمی: PassengerMinInstances 1 در
   .htaccess → حداقل یک پروسه همیشه زنده می‌ماند.
   این تابع روی هر بوت، هر دو .htaccess احتمالی (ریشهٔ اپ و
   public_html) را با مارکر idempotent اصلاح می‌کند.
   ============================================================ */

const HT_BLOCK = [
  "",
  "# --- anti cold-start (auto-managed by server.js) ---",
  "<IfModule mod_passenger.c>",
  "  PassengerMinInstances 1",
  "</IfModule>",
  "# --- end anti cold-start ---",
  "",
].join("\n");
const HT_MARKER = "# --- anti cold-start (auto-managed by server.js) ---";

function ensureAntiColdStart(dir) {
  try {
    const htFile = path.join(dir, ".htaccess");
    let content = "";
    if (fs.existsSync(htFile)) {
      content = fs.readFileSync(htFile, "utf8");
      if (content.includes(HT_MARKER)) return; // از قبل هست
    }
    /* فایل مال کاربر خودمان است؛ append امن است — چیزی بازنویسی نمی‌شود */
    fs.appendFileSync(htFile, HT_BLOCK);
    console.log("[bootstrap] anti cold-start → PassengerMinInstances 1 اضافه شد به", htFile);
  } catch (e) {
    console.error("[bootstrap] htaccess patch (non-fatal):", e.message);
  }
}

ensureAntiColdStart(ROOT);
if (process.env.HOME) ensureAntiColdStart(path.join(process.env.HOME, "public_html"));

/* ============================================================
   بخش ۲ — محیط پروداکشن
   ============================================================ */

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.NEXT_TELEMETRY_DISABLED = "1";

/* standalone باید روی 0.0.0.0 گوش دهد (متغیر HOSTNAME در لینوکس نام سرور است و باعث خطای bind می‌شود) */
process.env.HOSTNAME = "0.0.0.0";

/* Passenger پورت را از env می‌دهد؛ در نبودش 3000 */
if (!process.env.PORT) process.env.PORT = "3000";

/* دیتابیس SQLite — فایل پایدار در db/ کنار اپ (بیلد آن را پاک نمی‌کند)
   بوت‌استرپ: اگر custom.db نبود ولی init.db بود (اولین دیپلوی)،
   خودکار از init.db ساخته می‌شود — بدون نیاز به ترمینال */
const DB_DIR = path.join(ROOT, "db");
const DB_FILE = path.join(DB_DIR, "custom.db");
const INIT_FILE = path.join(DB_DIR, "init.db");
if (!fs.existsSync(DB_FILE) && fs.existsSync(INIT_FILE)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  fs.copyFileSync(INIT_FILE, DB_FILE);
  console.log("[bootstrap] دیتابیس ساخته شد (db/custom.db از init.db)");
}
/* همیشه دیتابیس خودِ اپ — اگر cPanel/env قدیمی DATABASE_URL دیگری
   ست کرده باشد، مسیر اشتباه زنده می‌ماند و همه کوئری‌ها خطا می‌دهند */
process.env.DATABASE_URL = "file:" + DB_FILE;

/* آپلودهای ادمین در <اپ>/data/uploads می‌مانند (پایدار، همراه بکاپ‌ها)
   و از طریق route داینامیک /uploads/<file> سرو می‌شوند */
/* ۸) کلید ایجنت‌های بلاگ — فایل .agent-secret منبع حقیقت AGENT_SECRET است
   و روی هر مقدار قدیمی env اولویت دارد؛ در هر بوت (با یا بدون پکیج)
   خوانده می‌شود تا تریگر گیت‌هاب با همان کلید پاس شود */
try {
  const secFile = path.join(ROOT, ".agent-secret");
  if (fs.existsSync(secFile)) {
    const val = fs.readFileSync(secFile, "utf8").trim();
    if (val) {
      process.env.AGENT_SECRET = val;
      console.log("[bootstrap] .agent-secret → AGENT_SECRET بارگذاری شد (override)");
      const dstDir = path.join(ROOT, ".next", "standalone");
      if (fs.existsSync(dstDir)) fs.copyFileSync(secFile, path.join(dstDir, ".agent-secret"));
    }
  }
} catch (e) {
  console.error("[bootstrap] agent-secret (non-fatal):", e.message);
}

process.env.UPLOAD_DIR = path.join(ROOT, "data", "uploads");
try {
  fs.mkdirSync(process.env.UPLOAD_DIR, { recursive: true });
} catch {
  /* noop */
}

const STANDALONE = path.join(ROOT, ".next", "standalone", "server.js");

if (!fs.existsSync(STANDALONE)) {
  console.error(
    "[bootstrap] بیلد پیدا نشد: .next/standalone/server.js موجود نیست.\n" +
      "دیپلوی را از گیت‌هاب اجرا کنید یا `bun run build` بزنید."
  );
  process.exit(1);
}

console.log("[bootstrap] starting standalone Next.js server…");
console.log("[bootstrap] DATABASE_URL =", process.env.DATABASE_URL);

require(STANDALONE);
