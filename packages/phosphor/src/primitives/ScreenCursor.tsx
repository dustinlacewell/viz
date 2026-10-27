import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { CURSOR_ARROW } from './cursor-arrow'
import { createScreenPointer, type ScreenPointer } from './screen-pointer'
import { trackPointer } from './track-pointer'

const ScreenPointerContext = createContext<ScreenPointer | null>(null)

/**
 * The mouse on the enclosing screen, or null when the screen has no
 * `cursor`. Children that draw their own cursor read it each frame and
 * `claim` it.
 */
export function useScreenPointer(): ScreenPointer | null {
  return useContext(ScreenPointerContext)
}

interface ScreenCursorProps {
  enabled: boolean
  children: ReactNode
}

/**
 * The cursor plumbing of a screen surface. Mount it as the direct
 * content of the screen; Display does this for its `cursor` prop.
 *
 * When enabled, it follows the mouse over the screen, shares the
 * position with `children` through `useScreenPointer`, and draws a lit
 * pointer on the glass. The system cursor is only hidden there (see
 * screen-cursor.css), and the drawn pointer takes no pointer events,
 * so clicks reach the content unchanged.
 *
 * The tree has the same shape either way, so toggling `enabled` never
 * remounts the screen's content.
 */
export function ScreenCursor({ enabled, children }: ScreenCursorProps) {
  const [pointer] = useState(createScreenPointer)
  const layerRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    const arrow = arrowRef.current
    const host = layer?.parentElement
    if (!enabled || !layer || !arrow || !host) return
    const stopPainting = pointer.subscribe(() => paintArrow(layer, arrow, pointer))
    const stopTracking = trackPointer(host, layer, pointer.set)
    return () => {
      stopTracking()
      stopPainting()
      pointer.set(null)
    }
  }, [enabled, pointer])

  return (
    <ScreenPointerContext.Provider value={enabled ? pointer : null}>
      {children}
      {enabled && (
        <div ref={layerRef} className="screen-cursor" aria-hidden="true">
          <svg
            ref={arrowRef}
            className="screen-cursor-pointer"
            width={CURSOR_ARROW.width}
            height={CURSOR_ARROW.height}
            viewBox={`${-CURSOR_ARROW.inset} ${-CURSOR_ARROW.inset} ${CURSOR_ARROW.width} ${CURSOR_ARROW.height}`}
          >
            <path d={CURSOR_ARROW.path} />
          </svg>
        </div>
      )}
    </ScreenPointerContext.Provider>
  )
}

/** Move the lit pointer by writing its transform, so the mouse never re-renders React. */
function paintArrow(layer: HTMLElement, arrow: SVGSVGElement, pointer: ScreenPointer) {
  const sample = pointer.get()
  if (!sample || pointer.claimed()) {
    delete layer.dataset.visible
    return
  }
  // The box starts `inset` before the tip; shift it so the tip lands on the mouse.
  const x = sample.x - CURSOR_ARROW.inset
  const y = sample.y - CURSOR_ARROW.inset
  arrow.style.transform = `translate(${x}px, ${y}px)`
  layer.dataset.visible = ''
}
