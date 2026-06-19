import { useEffect } from "react";

export function useAutoHorizontalScroll(ref, enabled = true, resetKey = "") {
  useEffect(() => {
    const el = ref.current;

    if (!el || !enabled) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    let frameId = 0;
    let position = 0;
    let pauseUntil = 0;
    let isVisible = true;
    let isAutoScrolling = false;

    const speed = 0.22;
    const userPauseMs = 4200;
    const pageScrollPauseMs = 1800;

    el.scrollLeft = 0;

    const now = () => window.performance.now();

    const pauseFor = (duration) => {
      pauseUntil = Math.max(pauseUntil, now() + duration);
      position = el.scrollLeft;
    };

    const canAutoScroll = () => {
      return (
        isVisible &&
        !document.hidden &&
        now() >= pauseUntil &&
        el.scrollWidth > el.clientWidth + 4
      );
    };

    const step = () => {
      if (canAutoScroll()) {
        const loopPoint = el.scrollWidth / 2;

        position += speed;

        isAutoScrolling = true;

        if (position >= loopPoint - 2) {
          position = 0;
          el.scrollLeft = 0;
        } else {
          el.scrollLeft = position;
        }

        window.requestAnimationFrame(() => {
          isAutoScrolling = false;
        });
      }

      frameId = window.requestAnimationFrame(step);
    };

    const handleUserInteraction = () => {
      pauseFor(userPauseMs);
    };

    const handlePageScroll = () => {
      pauseFor(pageScrollPauseMs);
    };

    const handleElementScroll = () => {
      if (!isAutoScrolling) {
        pauseFor(userPauseMs);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
          position = el.scrollLeft;
        }
      },
      {
        threshold: 0.12,
      }
    );

    observer.observe(el);

    el.addEventListener("scroll", handleElementScroll, { passive: true });
    el.addEventListener("touchstart", handleUserInteraction, { passive: true });
    el.addEventListener("touchmove", handleUserInteraction, { passive: true });
    el.addEventListener("touchend", handleUserInteraction, { passive: true });
    el.addEventListener("pointerdown", handleUserInteraction);
    el.addEventListener("pointermove", handleUserInteraction);
    el.addEventListener("pointerup", handleUserInteraction);
    el.addEventListener("wheel", handleUserInteraction, { passive: true });
    el.addEventListener("mouseenter", handleUserInteraction);
    el.addEventListener("mouseleave", handleUserInteraction);

    window.addEventListener("scroll", handlePageScroll, { passive: true });
    window.addEventListener("wheel", handlePageScroll, { passive: true });
    window.addEventListener("touchmove", handlePageScroll, { passive: true });

    frameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();

      el.removeEventListener("scroll", handleElementScroll);
      el.removeEventListener("touchstart", handleUserInteraction);
      el.removeEventListener("touchmove", handleUserInteraction);
      el.removeEventListener("touchend", handleUserInteraction);
      el.removeEventListener("pointerdown", handleUserInteraction);
      el.removeEventListener("pointermove", handleUserInteraction);
      el.removeEventListener("pointerup", handleUserInteraction);
      el.removeEventListener("wheel", handleUserInteraction);
      el.removeEventListener("mouseenter", handleUserInteraction);
      el.removeEventListener("mouseleave", handleUserInteraction);

      window.removeEventListener("scroll", handlePageScroll);
      window.removeEventListener("wheel", handlePageScroll);
      window.removeEventListener("touchmove", handlePageScroll);
    };
  }, [ref, enabled, resetKey]);
}