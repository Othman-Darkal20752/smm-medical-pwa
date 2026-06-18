import { useEffect } from "react";

export function useAutoHorizontalScroll(ref, enabled = true, resetKey = "") {
  useEffect(() => {
    const el = ref.current;

    if (!el || !enabled) return;

    let frameId;
    let paused = false;
    let position = 0;

    const speed = 0.28;

    el.scrollLeft = 0;

    const step = () => {
      if (!paused && el.scrollWidth > el.clientWidth) {
        const loopPoint = el.scrollWidth / 2;

        position += speed;

        if (position >= loopPoint - 2) {
          position = 0;
          el.scrollLeft = 0;
        } else {
          el.scrollLeft = position;
        }
      }

      frameId = requestAnimationFrame(step);
    };

    const pause = () => {
      paused = true;
      position = el.scrollLeft;
    };

    const resume = () => {
      window.setTimeout(() => {
        position = el.scrollLeft;
        paused = false;
      }, 700);
    };

    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);
    el.addEventListener("pointercancel", resume);

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);

      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("pointercancel", resume);
    };
  }, [ref, enabled, resetKey]);
}