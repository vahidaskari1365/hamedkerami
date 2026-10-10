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
import { useEffect, useRef, useState, type ReactNode } from "react";

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

/* ---------- Section reveal: rise + unblur ---------- */
const revealVariants: Variants = {
  hidden: { opacity: 0, y: 36, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

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
  return (
    <motion.div
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

  const fa = String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
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
