import { isOnScreen, toScreenPoint } from './screen-point'
import type { ScreenPointerSample } from './screen-pointer'

/**
 * Follow the mouse over `host` and report it in `layer`'s layout
 * pixels; `layer` covers the glass. Reports null when the mouse
 * leaves the glass, and for touch, which has no cursor. Returns the
 * teardown.
 */
export function trackPointer(
  host: HTMLElement,
  layer: HTMLElement,
  report: (sample: ScreenPointerSample | null) => void,
): () => void {
  const leave = () => report(null)
  const follow = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return leave()
    const layout = { width: layer.offsetWidth, height: layer.offsetHeight }
    const point = toScreenPoint(
      { x: e.clientX, y: e.clientY },
      layer.getBoundingClientRect(),
      layout,
    )
    // A captured drag can carry the mouse off the glass.
    if (!isOnScreen(point, layout)) return leave()
    report({ ...point, ...layout })
  }

  host.addEventListener('pointermove', follow)
  host.addEventListener('pointerdown', follow)
  host.addEventListener('pointerleave', leave)
  return () => {
    host.removeEventListener('pointermove', follow)
    host.removeEventListener('pointerdown', follow)
    host.removeEventListener('pointerleave', leave)
  }
}
