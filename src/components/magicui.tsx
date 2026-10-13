"use client";

/*
 * Magic UI component set — adapted from magicuidesign/magicui (MIT)
 * for Dr. Hamed Kermani's brand (ink/bone/teal), RTL and reduced-motion.
 * Components: AuroraText, WordRotate, AnimatedShinyText, ShimmerButton,
 * MagicCard, BorderBeam, DotPattern, Particles, PulsatingButton
 */

import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ---------------- shared: reduced motion hook ---------------- */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/* ================= AuroraText ================= */
/* Gradient with drifting background-position (clip: text) */
export function AuroraText({
  children,
  className,
  colors = ["#0f8a8d", "#5eead4", "#0d6e70", "#f4fdff"],
  speed = 1,
}: {
  children: ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}) {
  const style = useMemo(
    () => ({
      backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animationDuration: `${9 / speed}s`,
    }),
    [colors, speed],
  ) as CSSProperties;

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="sr-only">{children}</span>
      <span className="aurora-text" style={style} aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

/* ================= WordRotate ================= */
/* Rotating words with rotateX flip — RTL-safe */
export function WordRotate({
  words,
  duration = 2600,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      duration,
    );
    return () => clearInterval(interval);
  }, [words, duration, reduced]);

  return (
    <span className={cn("inline-block overflow-hidden align-bottom", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          initial={reduced ? { opacity: 0 } : { y: "80%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { y: "-80%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block will-change-transform"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ================= AnimatedShinyText ================= */
/* Shine sweep inside text — used for eyebrow badges */
export function AnimatedShinyText({
  children,
  className,
  shinyWidth = 120,
}: {
  children: ReactNode;
  className?: string;
  shinyWidth?: number;
}) {
  return (
    <span
      className={cn("shiny-text", className)}
      style={{ "--shiny-width": `${shinyWidth}px` } as CSSProperties}
    >
      {children}
    </span>
  );
}

/* ================= ShimmerButton ================= */
/* Rotating conic spark behind a solid backdrop — renders <a> or <button> */
type ShimmerButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  background?: string;
  shimmerColor?: string;
  ariaLabel?: string;
  type?: "button" | "submit";
};

export function ShimmerButton({
  children,
  className,
  href,
  onClick,
  external,
  background = "var(--color-teal)",
  shimmerColor = "rgba(255,255,255,0.85)",
  ariaLabel,
  type = "button",
}: ShimmerButtonProps) {
  const inner = (
    <>
      <span className="shimmer-spark" aria-hidden />
      <span
        className="absolute inset-[1.5px] rounded-[inherit]"
        style={{ background }}
        aria-hidden
      />
      <span className="absolute inset-[1.5px] rounded-[inherit] shadow-[inset_0_-8px_12px_rgba(255,255,255,0.14)]" aria-hidden />
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </>
  );

  const base = cn(
    "group relative inline-flex select-none items-center justify-center overflow-hidden rounded-full",
    "transform-gpu transition-transform duration-300 active:translate-y-px",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        className={base}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} className={base}>
      {inner}
    </button>
  );
}

/* ================= MagicCard ================= */
/* Pointer-tracking spotlight: gradient border + inner radial glow */
export function MagicCard({
  children,
  className,
  gradientSize = 220,
  gradientFrom = "rgba(15, 138, 141, 0.55)",
  gradientTo = "rgba(94, 234, 212, 0.35)",
  glowColor = "rgba(15, 138, 141, 0.07)",
  surface = "#ffffff",
}: {
  children: ReactNode;
  className?: string;
  gradientSize?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  surface?: string;
}) {
  const mouseX = useMotionValue(-gradientSize * 2);
  const mouseY = useMotionValue(-gradientSize * 2);

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY],
  );

  const handleLeave = useCallback(() => {
    mouseX.set(-gradientSize * 2);
    mouseY.set(-gradientSize * 2);
  }, [gradientSize, mouseX, mouseY]);

  const borderBackground = useMotionTemplate`
    linear-gradient(${surface} 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom}, ${gradientTo}, transparent 100%
    ) border-box
  `;
  const glowBackground = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${glowColor}, transparent 100%
    )
  `;

  return (
    <motion.div
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        "group relative isolate overflow-hidden rounded-[inherit] border border-transparent",
        className,
      )}
      style={{ background: borderBackground }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glowBackground }}
      />
      <div className="relative z-20 rounded-[inherit]">{children}</div>
    </motion.div>
  );
}

/* ================= BorderBeam ================= */
/* Conic highlight travelling around the border ring */
export function BorderBeam({
  className,
  color = "rgba(15, 138, 141, 0.95)",
  width = 2,
  speed = 6,
}: {
  className?: string;
  color?: string;
  width?: number;
  speed?: number;
}) {
  return (
    <span
      aria-hidden
      className={cn("border-beam", className)}
      style={
        {
          "--beam-color": color,
          "--beam-width": `${width}px`,
          "--beam-speed": `${speed}s`,
        } as CSSProperties
      }
    />
  );
}

/* ================= DotPattern ================= */
/* Static SVG dot grid — subtle section background */
export function DotPattern({
  className,
  dotColor = "rgba(15, 138, 141, 0.22)",
  size = 22,
  radius = 1.1,
}: {
  className?: string;
  dotColor?: string;
  size?: number;
  radius?: number;
}) {
  /* deterministic id from props — identical instances share identical (harmless) defs;
     avoids useId hydration-order sensitivity in dev overlay environments */
  const pid = `dots-${size}-${radius}-${dotColor.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}>
      <defs>
        <pattern id={pid} width={size} height={size} patternUnits="userSpaceOnUse">
          <circle cx={size / 2} cy={size / 2} r={radius} fill={dotColor} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/* ================= Particles ================= */
/* Lightweight canvas particles — drift + twinkle, DPR-aware,
   pauses offscreen & on hidden tab, static under reduced motion */
export function Particles({
  className,
  quantity = 60,
  color = "#5eead4",
  maxOpacity = 0.45,
  minSize = 0.8,
  maxSize = 2.2,
  speed = 0.35,
}: {
  className?: string;
  quantity?: number;
  color?: string;
  maxOpacity?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = {
      x: number; y: number; r: number; vx: number; vy: number;
      phase: number; twinkle: number; alpha: number;
    };
    let particles: P[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const seed = () => {
      const count = Math.round(quantity * Math.min(1, (w * h) / (1440 * 900)));
      particles = Array.from({ length: Math.max(18, count) }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(minSize, maxSize),
        vx: rand(-speed, speed),
        vy: rand(-speed, speed),
        phase: rand(0, Math.PI * 2),
        twinkle: rand(0.004, 0.016),
        alpha: rand(0.2, maxOpacity),
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.phase += p.twinkle;
        const a = reduced
          ? p.alpha
          : p.alpha * (0.55 + 0.45 * Math.sin(p.phase));
        ctx.globalAlpha = Math.max(0.05, a);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -4) p.x = w + 4;
          if (p.x > w + 4) p.x = -4;
          if (p.y < -4) p.y = h + 4;
          if (p.y > h + 4) p.y = -4;
        }
      }
      ctx.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        if (visible && !running && !reduced) {
          running = true;
          raf = requestAnimationFrame(draw);
        } else if (!visible && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!document.hidden && !running && !reduced) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [quantity, color, maxOpacity, minSize, maxSize, speed, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}

/* ================= PulsatingButton ================= */
/* Expanding halo ring — renders <a> or <button> */
export function PulsatingButton({
  children,
  className,
  href,
  external,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  external?: boolean;
  ariaLabel?: string;
}) {
  const cls = cn(
    "pulse-cta relative inline-flex items-center justify-center rounded-full",
    className,
  );
  if (href) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return <button className={cls}>{children}</button>;
}
