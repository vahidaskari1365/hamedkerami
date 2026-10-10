"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

type Cover = { src: string; title: string };

/* ---------- physics constants ---------- */
const BASE_SPEED = 8; // deg/s — idle auto-rotation
const FLING_MAX = 240; // deg/s — velocity cap after release
const LIFT_Z = 64; // px — hover lift toward viewer
const LIFT_SCALE = 1.13; // hover grow
const BASE_CARD_TF = "translate(-50%, -50%)";
const LIFTED_CARD_TF = `translate(-50%, -50%) translateZ(${LIFT_Z}px) scale(${LIFT_SCALE})`;

/**
 * CoverCarousel — حلقه‌ی چرخان سه‌بعدی کاور نمونه کارها
 * کارت‌ها مستطیل می‌مانند اما روی یک سیلندر سه‌بعدی می‌چرخند:
 *  - چرخش خودکار نرم (با فیزیک اینرسی)
 *  - درگ با موس و لمس (pointer events) + فلیک
 *  - هاور/لمس هر کارت: بلند شدن به سمت بیننده + بزرگ‌نمایی + روشن‌تر شدن
 *  - عمق‌نمایی: کارت‌های دورتر کم‌رنگ‌تر
 *  - prefers-reduced-motion: چرخش خودکار خاموش، درگ فعال
 */
export function CoverCarousel({
  covers,
  onSelect,
}: {
  covers: Cover[];
  onSelect: (src: string) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  const s = useRef({
    rotation: 0,
    velocity: 0,
    dragging: false,
    captured: false,
    pointerId: -1,
    lastX: 0,
    lastT: 0,
    moved: 0,
    active: -1,
    radius: 400,
    step: 360 / Math.max(covers.length, 1),
    reduced: false,
    inView: false,
  });

  /* ---------- deactivate / activate ---------- */
  const deactivate = useCallback(() => {
    const st = s.current;
    if (st.active < 0) return;
    const el = cardRefs.current[st.active];
    if (el) {
      el.style.transform = BASE_CARD_TF;
      el.classList.remove("is-active");
    }
    st.active = -1;
  }, []);

  const activate = useCallback(
    (i: number) => {
      const st = s.current;
      if (st.dragging || st.active === i) return;
      // فقط کارت‌هایی که رو به بیننده هستند فعال می‌شوند
      const a = (((i * st.step + st.rotation) % 360) + 360) % 360;
      if (Math.cos((a * Math.PI) / 180) < 0.1) return;
      deactivate();
      st.active = i;
      const el = cardRefs.current[i];
      if (el) {
        el.style.transform = LIFTED_CARD_TF;
        el.classList.add("is-active");
      }
    },
    [deactivate]
  );

  /* ---------- layout: measure cards, compute ring radius ---------- */
  const layout = useCallback(() => {
    const st = s.current;
    const stage = stageRef.current;
    const first = cardRefs.current[0];
    if (!stage || !first) return;
    const cw = first.offsetWidth || 224;
    const ch = Math.round((cw * 16) / 9);
    const n = Math.max(covers.length, 1);
    const ideal = cw / 2 / Math.tan(Math.PI / n) + 48; // حلقه‌ی بدون همپوشانی
    const maxR = Math.max(170, stage.offsetWidth * 0.5); // حلقه همیشه داخل عرض صفحه می‌ماند
    st.radius = Math.round(Math.min(ideal, maxR));
    stage.style.height = `${Math.round(ch * 1.45 + 40)}px`;
    if (floorRef.current) {
      floorRef.current.style.top = `calc(50% + ${Math.round(ch * 0.62)}px)`;
    }
    covers.forEach((_, i) => {
      const wrapper = cardRefs.current[i]?.parentElement;
      if (wrapper) {
        wrapper.style.transform = `rotateY(${(i * st.step).toFixed(3)}deg) translateZ(${st.radius}px)`;
      }
    });
  }, [covers]);

  /* ---------- animation loop + observers ---------- */
  useEffect(() => {
    const st = s.current;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    st.reduced = mq.matches;
    const onMq = () => {
      st.reduced = mq.matches;
    };
    mq.addEventListener("change", onMq);

    const io = new IntersectionObserver(
      (entries) => {
        st.inView = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "120px" }
    );
    if (stageRef.current) io.observe(stageRef.current);

    const ro = new ResizeObserver(() => layout());
    if (stageRef.current) ro.observe(stageRef.current);

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - prev, 64);
      prev = now;
      const ring = ringRef.current;
      if (!ring || !st.inView) return;

      if (!st.dragging) {
        // اینرسی نرم به سمت سرعت هدف (توقف هنگام هاور / کاهش حرکت)
        const target = st.active >= 0 || st.reduced ? 0 : BASE_SPEED;
        st.velocity += (target - st.velocity) * (1 - Math.exp(-dt / 850));
        st.rotation += (st.velocity * dt) / 1000;
      }
      ring.style.transform = `rotateY(${st.rotation.toFixed(3)}deg)`;

      // عمق‌نمایی: هرچه کارت از دید دورتر، کم‌رنگ‌تر (فقط opacity — کامپوزیت سبک)
      // + محو نرم قبل از لبه‌ی ۹۰ درجه تا چرخش backface پرش نداشته باشد
      for (let i = 0; i < cardRefs.current.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const a = (((i * st.step + st.rotation) % 360) + 360) % 360;
        const c = Math.cos((a * Math.PI) / 180);
        const depth = (c + 1) / 2;
        const edge = Math.min(1, Math.max(0, (c - 0.04) / 0.2));
        if (i === st.active) {
          el.style.opacity = "1";
        } else {
          el.style.opacity = (edge * (0.16 + 0.84 * depth)).toFixed(3);
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, [layout]);

  /* first layout before paint */
  useEffect(() => {
    layout();
  }, [layout]);

  /* ---------- drag / flick (mouse + touch) ---------- */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = s.current;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    st.dragging = true;
    st.captured = false;
    st.pointerId = e.pointerId;
    st.lastX = e.clientX;
    st.lastT = performance.now();
    st.moved = 0;
    st.velocity = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = s.current;
    if (!st.dragging || e.pointerId !== st.pointerId) return;
    const dx = e.clientX - st.lastX;
    st.lastX = e.clientX;
    const now = performance.now();
    const dt = Math.max(now - st.lastT, 1);
    st.lastT = now;
    st.moved += Math.abs(dx);
    // کپچر فقط وقتی درگ واقعی شروع شد — تا تپ ساده روی کارت به کلیک تبدیل شود
    if (!st.captured && st.moved > 6) {
      st.captured = true;
      deactivate();
      try {
        stageRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      stageRef.current?.classList.add("dragging");
    }
    if (!st.captured) return;
    const k = 210 / st.radius; // درجه به ازای هر پیکسل
    st.rotation += dx * k;
    st.velocity = st.velocity * 0.65 + ((dx * k * 1000) / dt) * 0.35;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = s.current;
    if (!st.dragging || e.pointerId !== st.pointerId) return;
    st.dragging = false;
    if (st.captured) {
      st.velocity = Math.max(-FLING_MAX, Math.min(FLING_MAX, st.velocity));
      try {
        stageRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      stageRef.current?.classList.remove("dragging");
    } else {
      st.velocity = 0; // تپ ساده — بدون پرتاب
    }
    st.captured = false;
  };

  /* ---------- keyboard ---------- */
  const onStageKeyDown = (e: React.KeyboardEvent) => {
    const st = s.current;
    if (e.key === "ArrowLeft") {
      st.velocity = -70;
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      st.velocity = 70;
      e.preventDefault();
    } else if ((e.key === "Enter" || e.key === " ") && st.active >= 0) {
      e.preventDefault();
      const c = covers[st.active];
      deactivate();
      onSelect(c.src);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-14"
    >
      {/* هاله‌ی نئون پشت حلقه */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[64%] w-[78%] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/10 blur-[100px]"
      />

      <div
        ref={stageRef}
        className="ring-stage relative h-[26rem] w-full sm:h-[34rem] lg:h-[40rem]"
        style={{ perspective: "2200px" }}
        role="group"
        aria-label="حلقه‌ی چرخان کاور نمونه کارها — با موس یا انگشت بچرخانید"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onStageKeyDown}
      >
        {/* سایه‌ی زمین زیر حلقه */}
        <div
          ref={floorRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 h-9 w-[58%] max-w-xl -translate-x-1/2 rounded-[100%] bg-black/70 blur-2xl"
        />

        {/* حلقه‌ی سه‌بعدی */}
        <div
          ref={ringRef}
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {covers.map((c, i) => (
            <div
              key={c.src}
              className="h-0 w-0"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${(i * (360 / covers.length)).toFixed(3)}deg) translateZ(400px)`,
              }}
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="ring-card absolute left-0 top-0 w-32 sm:w-48 lg:w-56"
                style={{ transform: BASE_CARD_TF }}
              >
                <figure
                  tabIndex={0}
                  aria-label={`${c.title} — برای نمایش بزرگ کلیک کنید`}
                  className="group relative aspect-[9/16] cursor-zoom-in overflow-hidden rounded-2xl bg-ink-3 shadow-2xl ring-1 ring-white/10 transition-shadow group-hover:ring-teal/50"
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") activate(i);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === "mouse" && s.current.active === i) deactivate();
                  }}
                  onPointerDown={(e) => {
                    if (e.pointerType !== "mouse") activate(i);
                  }}
                  onFocus={() => activate(i)}
                  onBlur={() => {
                    if (s.current.active === i) deactivate();
                  }}
                  onClick={() => {
                    if (s.current.moved < 8) {
                      deactivate();
                      onSelect(c.src);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      deactivate();
                      onSelect(c.src);
                    }
                  }}
                >
                  <Image
                    src={c.src}
                    alt={`${c.title} — نمونه کار جراحی فک و صورت دکتر کرمانی`}
                    fill
                    sizes="(max-width: 640px) 45vw, 260px"
                    draggable={false}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                  <figcaption className="absolute bottom-0 right-0 left-0 p-4 text-xs font-extrabold text-white">
                    {c.title}
                  </figcaption>
                </figure>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* راهنمای تعامل */}
      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs font-bold text-white/40">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M8 3 4 7l4 4" />
          <path d="M4 7h16" />
          <path d="m16 21 4-4-4-4" />
          <path d="M20 17H4" />
        </svg>
        حلقه را با موس یا انگشت بچرخانید — مکث روی هر کاور، آن را بزرگ‌تر نشان می‌دهد
      </p>
    </motion.div>
  );
}
