/* تست قفل تاریخ evergreen — اجرا: bun scripts/test-not-before.ts */
import { TOPIC_QUEUE, EVERGREEN_TOPICS, nextTopic } from "../src/lib/agents/topics";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date());
console.log("امروز (تهران):", today);

/* ۱) هیچ تاپیک ۱۴۰۶ در صف فعال نباشد */
const inQueue = TOPIC_QUEUE.filter((t) => t.slug.includes("1406") || t.title.includes("۱۴۰۶"));
console.log("تاپیک ۱۴۰۶ در صف فعال:", inQueue.length === 0 ? "✓ هیچ" : "✗ " + inQueue.map((t) => t.slug).join(","));

/* ۲) شبیه‌سازی اتمام صف اصلی → evergreen قفل‌شده نباید برگردد */
const allMainTitles = TOPIC_QUEUE.map((t) => t.title);
const allMainSlugs = TOPIC_QUEUE.map((t) => t.slug);
const t = nextTopic(allMainTitles, allMainSlugs);
console.log("صف اصلی تمام + قفل تاریخ:", t === null ? "✓ null (evergreen قفل است)" : "✗ برگرداند: " + t.slug);

/* ۳) شبیه‌سازی ۱ فروردین ۱۴۰۶ — قفل باز شود */
const fake = "2027-03-21";
const unlocked = EVERGREEN_TOPICS.filter((x) => (x.notBefore ?? "") <= fake);
console.log("بعد از ۲۰۲۷-۰۳-۲۱ باز می‌شود:", unlocked.map((x) => x.slug).join(" + ") || "هیچ");

/* ۴) شبیه‌سازی انتشار واقعی: صف اصلی تمام + ۱۴۰۶ در db منتشرشده → هرگز دوباره ندهد */
const t2 = nextTopic([...allMainTitles, "هزینه جراحی فک ۱۴۰۶؛ جدول قیمت به‌روز تک‌فک، بایمکس و جنیوپلاستی + راهنمای بیمه"], [...allMainSlugs, "jaw-surgery-cost-1406"]);
console.log("صف تمام + ۱۴۰۶ منتشرشده:", t2 === null ? "✓ null" : "✗ " + t2.slug);
