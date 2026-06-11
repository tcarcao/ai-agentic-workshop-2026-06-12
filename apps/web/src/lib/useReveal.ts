import { useEffect } from "react";

/**
 * Plays the `.reveal` entrance animation robustly.
 * Elements at/near the viewport reveal immediately; ones further down
 * reveal on scroll; and a short fallback guarantees nothing stays hidden
 * (the IntersectionObserver alone leaves below-the-fold content at opacity:0
 * when the page doesn't scroll).
 */
export function useReveal(dep?: unknown) {
  useEffect(() => {
    const reveal = (el: Element) => el.classList.add("in");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0 },
    );
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight + 120) reveal(el);
      else io.observe(el);
    });
    const t = window.setTimeout(
      () => document.querySelectorAll(".reveal:not(.in)").forEach(reveal),
      700,
    );
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [dep]);
}
