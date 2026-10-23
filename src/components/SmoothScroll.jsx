import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/* One Lenis instance drives the whole page. It is skipped for people who ask
   their system for reduced motion, and every helper below falls back to
   normal browser scrolling when there is no instance.

   Scrollable areas inside the page (modals, dropdowns, side panels, chat
   lists, textareas) need the attribute  data-lenis-prevent  so the wheel
   scrolls them instead of the page:
     <div className="modal-body" data-lenis-prevent>...</div>
*/
let lenis = null;
let locks = 0;

function createLenis() {
  if (lenis) return;
  lenis = new Lenis({ autoRaf: true, duration: 1.15, smoothWheel: true });
  // A modal may have asked for a lock before the instance existed.
  if (locks > 0) lenis.stop();
}

function destroyLenis() {
  lenis?.destroy();
  lenis = null;
}

export default function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Follow the system setting, including changes made while the page is open.
    const sync = () => (mq.matches ? destroyLenis() : createLenis());
    sync();
    mq.addEventListener("change", sync);

    return () => {
      mq.removeEventListener("change", sync);
      destroyLenis();
    };
  }, []);
  return null;
}

/* Replaces window.scrollTo({ top: 0, behavior: "smooth" }).
   Pass { immediate: true } on route changes so the new page does not
   visibly scroll up from the old position. */
export function scrollToTop({ immediate = false } = {}) {
  if (lenis) lenis.scrollTo(0, { immediate, duration: 0.9 });
  else window.scrollTo(0, 0);
}

/* Replaces el.scrollIntoView({ behavior: "smooth" }).
   offset is in px; use a negative value to leave a gap above the element,
   e.g. -(headerHeight + 16) when you have a sticky header. */
export function scrollToElement(el, offset = -16) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 0.9 });
  else el.scrollIntoView({ block: "start" });
}

/* Call after content height changes (images loading, accordions, new route
   content) if the page stops short of the bottom. */
export function resizeScroll() {
  lenis?.resize();
}

/* Freeze page scrolling while a modal, dialog or drawer is open. */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;
    locks += 1;
    lenis?.stop();
    return () => {
      locks = Math.max(0, locks - 1);
      if (locks === 0) lenis?.start();
    };
  }, [locked]);
}