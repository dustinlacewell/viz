import { useRef, useState, type RefObject } from 'react'
import { regionToNdc, type CrtRegionRect } from './region'

export interface CrtRegion<T extends HTMLElement> {
  /** Attach to the HTML box that marks where the drawing goes. */
  ref: RefObject<T | null>
  /** Measure the box against the screen's CRT. Cheap enough to call every frame. */
  read(): CrtRegionRect | null
}

/**
 * Mark an HTML box on the screen as a place to draw into the CRT. The
 * box keeps its place in the layout; your passes read its position
 * each frame, so it follows any layout change.
 */
export function useCrtRegion<T extends HTMLElement>(): CrtRegion<T> {
  const ref = useRef<T | null>(null)
  const [region] = useState<CrtRegion<T>>(() => ({
    ref,
    read() {
      const el = ref.current
      const crt = el && findCrt(el)
      if (!el || !crt) return null
      return regionToNdc(el.getBoundingClientRect(), crt.getBoundingClientRect())
    },
  }))
  return region
}

/** The CRT of the screen that holds `el`: a `.crt-screen` child of an ancestor. */
function findCrt(el: HTMLElement): Element | null {
  return el.closest(':has(> .crt-screen)')?.querySelector(':scope > .crt-screen') ?? null
}
