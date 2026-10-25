"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Image from "next/image";

/* ---------- Scroll progress bar (cinematic top bar) ---------- */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 right-0 left-0 h-[3px] z-[100] origin-right bg-gradient-to-l from-teal via-teal-2 to-sand"
      style={{ scaleX }}
    />
  );
}

/* ---------- Section reveal: rise + unblur ----------
   GEO (ممیزی geo-optimizer-skill): framer-motion حالت اولیه
   opacity:0 را به‌صورت استایل اینلاین در HTML سروری می‌نوشت و
   خزنده‌های AI آن را الگوی cloaking («متن پنهان») پرچم می‌کردند.
   راه‌حل: تا قبل از hydration یک div ساده و کاملاً قابل‌مشاهده
   رندر می‌کنیم (HTML اولیه = بدون هیچ استایل مخفی) و بعد از
   mount، همان انیمیشن whileInView اجرا می‌شود. خزنده و کاربر
   بدون جاوااسکریپت همه‌چیز را می‌بینند؛ تجربه انیمیشن حفظ شده. */
const revealVariants: Variants = {
  hidden: { opacity: 0, y: 36, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

/* تشخیص hydration بدون setState-in-effect — الگوی رسمی React.
   SSR و رندر اولیه hydration: false | بعد از hydration: true */
const emptySubscribe = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key="reveal"
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Staggered line reveal (hero headlines) ---------- */
export function LineReveal({
  lines,
  className,
  lineClassName,
  startDelay = 0,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  startDelay?: number;
}) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden py-[0.12em]">
          <motion.span
            className={`block ${lineClassName ?? ""}`}
            initial={{ y: "110%", rotate: 2 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{
              duration: 1.05,
              delay: startDelay + i * 0.14,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ---------- Animated counter ---------- */
export function Counter({
  to,
  suffix = "",
  duration = 2,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  /* جداکننده هزارگان فارسی — ۲۰۰۰۰ → ۲۰٬۰۰۰ */
  const grouped = String(val).replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  const fa = grouped.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
  return (
    <span ref={ref} className={className} dir="ltr">
      {fa}
      {suffix}
    </span>
  );
}

/* ---------- Parallax wrapper ---------- */
export function Parallax({
  children,
  speed = 0.25,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `-${speed * 100}%`]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y }} className="relative h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/* ---------- Page transition wrapper ---------- */
const pageVariants: Variants = {
  enter: { opacity: 0, y: 24, filter: "blur(6px)" },
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: "blur(4px)",
    transition: { duration: 0.35, ease: "easeIn" },
  },
};

export function PageTransition({
  routeKey,
  children,
}: {
  routeKey: string;
  children: ReactNode;
}) {
  return (
    <motion.main
      key={routeKey}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="min-h-[70vh]"
    >
      {children}
    </motion.main>
  );
}

/* ---------- Marquee strip ---------- */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden py-4 border-y border-white/10 bg-ink-2/60">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-10 text-sm text-white/70 tracking-wide"
          >
            {t}
            <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-teal" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   موشن گرافیک سینمایی — لایه سینما روی کل سایت
   CinematicImage (ken-burns + نور سینمایی) / TiltCard (عمق ۳بعدی)
   FilmGrain (دانه فیلم) / CinemaIntro (پرده افتتاحیه)
   همگی با prefers-reduced-motion و لمس سازگارند.
   ============================================================ */

const REDUCED = "(prefers-reduced-motion: reduce)";

/* ---------- CinematicImage: ken-burns آرام + جرقه نور طلایی ---------- */
export function CinematicImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
  sweep = true,
  kenburns = true,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  sweep?: boolean;
  kenburns?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={kenburns ? { scale: 1.14 } : false}
        animate={inView ? { scale: 1 } : undefined}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "100vw"}
          className={`object-cover ${className ?? ""}`}
        />
      </motion.div>
      {sweep && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-3/4 w-1/2 -skew-x-12 bg-gradient-to-l from-transparent via-white/18 to-transparent"
          initial={{ x: "-140%" }}
          animate={inView ? { x: "340%" } : undefined}
          transition={{ duration: 1.7, delay: 0.35, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

/* ---------- TiltCard: عمق سه‌بعدی با درخشش طلایی دنبال‌کننده ---------- */
export function TiltCard({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 260, damping: 24 });
  const sry = useSpring(ry, { stiffness: 260, damping: 24 });
  const gxStyle = useTransform(gx, (v) => `${v}%`);
  const gyStyle = useTransform(gy, (v) => `${v}%`);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return; // لمس — غیرفعال
    const t = setTimeout(() => setOn(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!on) return <div className={className}>{children}</div>;

  const move = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
  };

  return (
    <motion.div
      ref={ref}
      className={`${className ?? ""} relative [transform-style:preserve-3d]`}
      style={{ rotateX: srx, rotateY: sry, perspective: 900 }}
      onMouseMove={move}
      onMouseLeave={leave}
    >
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_var(--gx)_var(--gy),rgba(233,207,135,0.14),transparent_55%)]"
        style={{ "--gx": gxStyle, "--gy": gyStyle } as React.CSSProperties}
      />
    </motion.div>
  );
}

/* ---------- FilmGrain: دانه فیلم روی بخش‌های تیره ---------- */
export function FilmGrain({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <span
      aria-hidden
      className="film-grain pointer-events-none absolute inset-0 z-[5]"
      style={{ opacity }}
    />
  );
}

/* ---------- CinemaIntro: پرده افتتاحیه (هر نشست یک بار) ---------- */
export function CinemaIntro() {
  const [show, setShow] = useState(false);
  const [gone, setGone] = useState(true);

  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;
    try {
      if (sessionStorage.getItem("cinema-intro") === "1") return;
      sessionStorage.setItem("cinema-intro", "1");
    } catch {
      /* private mode */
    }
    const t1 = setTimeout(() => {
      setGone(false);
      setShow(true);
    }, 0);
    const t = setTimeout(() => {
      setShow(false);
      setTimeout(() => setGone(true), 700);
    }, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t);
    };
  }, []);

  if (gone) return null;
  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink"
      initial={{ opacity: 1 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.65, ease: "easeInOut" }}
    >
      <motion.span
        className="block h-px bg-gradient-to-l from-transparent via-teal to-transparent"
        initial={{ width: 0 }}
        animate={show ? { width: "min(360px, 60vw)" } : { width: "min(360px, 60vw)" }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}
