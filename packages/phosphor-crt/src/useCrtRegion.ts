import { useEffect, useRef, useState, type RefObject } from 'react'
import { regionToNdc, type CrtRegionRect } from './region'

export interface CrtRegion<T extends HTMLElement> {
  /** Attach to the HTML box that marks where the drawing goes. */
  ref: RefObject<T | null>
  /** The box's place on the screen's CRT, or null before it is first measured. Free to call every frame. */
  read(): CrtRegionRect | null
}

/**
 * Mark an HTML box on the screen as a place to draw into the CRT. The
 * box keeps its place in the layout; your passes read its position
 * each frame.
 *
 * The box is measured when it, its parent or the CRT changes size, in
 * a ResizeObserver callback: layout is already done there, so the
 * measure costs nothing. Measuring inside a frame instead would force
 * the browser to redo style and layout first, every frame. Scrolling
 * needs no measure, since the box and the CRT move together.
 */
export function useCrtRegion<T extends HTMLElement>(): CrtRegion<T> {
  const ref = useRef<T | null>(null)
  const rect = useRef<CrtRegionRect | null>(null)
  const [region] = useState<CrtRegion<T>>(() => ({ ref, read: () => rect.current }))

  useEffect(() => {
    const el = ref.current
    const crt = el && findCrt(el)
    if (!el || !crt) return
    const measure = () => {
      rect.current = regionToNdc(el.getBoundingClientRect(), crt.getBoundingClientRect())
    }
    const observer = new ResizeObserver(measure)
    for (const node of [el, el.parentElement, crt]) if (node) observer.observe(node)
    return () => {
      observer.disconnect()
      rect.current = null
    }
  }, [])

  return region
}

/** The CRT of the screen that holds `el`: a `.crt-screen` child of an ancestor. */
function findCrt(el: HTMLElement): Element | null {
  return el.closest(':has(> .crt-screen)')?.querySelector(':scope > .crt-screen') ?? null
}
