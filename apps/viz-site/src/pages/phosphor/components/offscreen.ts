import { useEffect, type RefObject } from 'react'

/*
 * Marks elements `data-offscreen` while no part of them is in the
 * viewport. Chrome's own `content-visibility: auto` keeps about two
 * screens around the viewport live; this mark is exact, so CSS can
 * skip more during costly work (see `.site-row` in site.css).
 */

let observer: IntersectionObserver | null = null

function shared(): IntersectionObserver {
  observer ??= new IntersectionObserver((entries) => {
    for (const e of entries) e.target.toggleAttribute('data-offscreen', !e.isIntersecting)
  })
  return observer
}

/** Keep `data-offscreen` on the element current while it is mounted. */
export function useOffscreenMark(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = shared()
    io.observe(el)
    return () => {
      io.unobserve(el)
      el.removeAttribute('data-offscreen')
    }
  }, [ref])
}
