import Link from "next/link";

/* صفحه ۴۰۴ برنددار — تجربه کاربری بهتر و حفظ بازدیدکننده (SXO) */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-center text-white">
      <p className="text-7xl font-black text-teal sm:text-9xl">۴۰۴</p>
      <h1 className="mt-6 text-2xl font-black sm:text-3xl">
        این صفحه پیدا نشد
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-white/60">
        ممکن است آدرس تغییر کرده باشد یا صفحه حذف شده باشد. از لینک های زیر
        می توانید مسیر درست را پیدا کنید.
      </p>
      <nav className="mt-8 flex flex-wrap items-center justify-center gap-3" aria-label="لینک های اصلی">
        <Link
          href="/"
          className="rounded-full bg-teal px-6 py-3 text-xs font-bold text-white transition hover:bg-teal-2"
        >
          صفحه اصلی
        </Link>
        <Link
          href="/services"
          className="rounded-full bg-white/10 px-6 py-3 text-xs font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20"
        >
          خدمات
        </Link>
        <Link
          href="/blog"
          className="rounded-full bg-white/10 px-6 py-3 text-xs font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20"
        >
          وبلاگ آموزشی
        </Link>
        <Link
          href="/contact"
          className="rounded-full bg-white/10 px-6 py-3 text-xs font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20"
        >
          تماس و رزرو نوبت
        </Link>
      </nav>
    </div>
  );
}
