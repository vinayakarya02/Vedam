"use client";

import { useRef, useEffect, useCallback } from "react";

const LOOP_DURATION_MS = 45000;
const WHEEL_FACTOR = 1;

export interface TestimonialItem {
  name: string;
  role: string;
  achievement: string;
  text: string;
}

function wrapPosition(pos: number, half: number) {
  if (half <= 0) return pos;
  while (pos <= -half) pos += half;
  while (pos > 0) pos -= half;
  return pos;
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  return (
    <article className="glass-card p-6 w-[320px] shrink-0 flex flex-col">
      <p className="text-muted-foreground mb-5 italic leading-relaxed flex-1">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <div className="pt-4 border-t border-white/5">
        <div className="font-medium text-sm">{testimonial.name}</div>
        <div className="text-xs text-vedam-orange mt-0.5">{testimonial.role}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {testimonial.achievement}
        </div>
      </div>
    </article>
  );
}

export function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const halfWidthRef = useRef(0);
  const isPausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const prefersReducedMotionRef = useRef(false);

  const loopedTestimonials = [...testimonials, ...testimonials];

  const applyTransform = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
    }
  }, []);

  const measureHalfWidth = useCallback(() => {
    if (trackRef.current) {
      halfWidthRef.current = trackRef.current.scrollWidth / 2;
      positionRef.current = wrapPosition(positionRef.current, halfWidthRef.current);
      applyTransform();
    }
  }, [applyTransform]);

  const nudge = useCallback(
    (delta: number) => {
      positionRef.current = wrapPosition(
        positionRef.current + delta,
        halfWidthRef.current
      );
      applyTransform();
    },
    [applyTransform]
  );

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    measureHalfWidth();

    const observer = new ResizeObserver(measureHalfWidth);
    if (trackRef.current) observer.observe(trackRef.current);

    const container = containerRef.current;

    const onWheelNative = (e: WheelEvent) => {
      if (!isPausedRef.current) return;
      e.preventDefault();
      const delta =
        (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) *
        WHEEL_FACTOR;
      nudge(-delta);
    };
    container?.addEventListener("wheel", onWheelNative, { passive: false });

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartXRef.current;
      positionRef.current = wrapPosition(
        dragStartPosRef.current + dx,
        halfWidthRef.current
      );
      applyTransform();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    const tick = (time: number) => {
      const dt = lastTimeRef.current ? time - lastTimeRef.current : 0;
      lastTimeRef.current = time;

      if (
        !isPausedRef.current &&
        !prefersReducedMotionRef.current &&
        halfWidthRef.current > 0
      ) {
        const speed = halfWidthRef.current / LOOP_DURATION_MS;
        positionRef.current = wrapPosition(
          positionRef.current - speed * dt,
          halfWidthRef.current
        );
        applyTransform();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      container?.removeEventListener("wheel", onWheelNative);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [applyTransform, measureHalfWidth, nudge]);

  const pauseOnHover = () => {
    isPausedRef.current = true;
    lastTimeRef.current = 0;
  };

  const resumeOnLeave = () => {
    isPausedRef.current = false;
    isDraggingRef.current = false;
    lastTimeRef.current = 0;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!isPausedRef.current) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = positionRef.current;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    pauseOnHover();
    isDraggingRef.current = true;
    dragStartXRef.current = e.touches[0].clientX;
    dragStartPosRef.current = positionRef.current;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.touches[0].clientX - dragStartXRef.current;
    positionRef.current = wrapPosition(
      dragStartPosRef.current + dx,
      halfWidthRef.current
    );
    applyTransform();
  };

  const onTouchEnd = () => {
    isDraggingRef.current = false;
    isPausedRef.current = false;
    lastTimeRef.current = 0;
  };

  return (
    <div
      ref={containerRef}
      className="overflow-hidden px-4 sm:px-6 lg:px-8 cursor-grab active:cursor-grabbing select-none touch-none"
      onMouseEnter={pauseOnHover}
      onMouseLeave={resumeOnLeave}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Testimonials carousel. Hover to pause and scroll manually."
    >
      <div ref={trackRef} className="flex w-max gap-5 will-change-transform">
        {loopedTestimonials.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
        ))}
      </div>
    </div>
  );
}
