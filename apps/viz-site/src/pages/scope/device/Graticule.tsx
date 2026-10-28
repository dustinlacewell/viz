import type { CSSProperties } from 'react'
import { DIVISIONS_X, DIVISIONS_Y } from './scope-state'

/**
 * The scope's division grid, laid over the glass. Faint lines mark
 * each division; the two centre axes are a little brighter. It
 * ignores the pointer.
 */
export function Graticule() {
  return (
    <svg
      style={OVERLAY}
      viewBox={`0 0 ${DIVISIONS_X} ${DIVISIONS_Y}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {range(1, DIVISIONS_X).map((x) => (
        <line key={`x${x}`} x1={x} y1={0} x2={x} y2={DIVISIONS_Y} {...lineProps(x === DIVISIONS_X / 2)} />
      ))}
      {range(1, DIVISIONS_Y).map((y) => (
        <line key={`y${y}`} x1={0} y1={y} x2={DIVISIONS_X} y2={y} {...lineProps(y === DIVISIONS_Y / 2)} />
      ))}
    </svg>
  )
}

/* Stroke goes through `style`: SVG attributes do not resolve var(). */
function lineProps(axis: boolean) {
  return {
    style: { stroke: axis ? AXIS : GRID },
    strokeWidth: 1,
    vectorEffect: 'non-scaling-stroke' as const,
  }
}

/** Integers from `from` up to, not including, `to`. */
function range(from: number, to: number): number[] {
  return Array.from({ length: to - from }, (_, i) => from + i)
}

const GRID = 'oklch(0.78 0.04 var(--theme-hue) / 0.12)'
const AXIS = 'oklch(0.78 0.04 var(--theme-hue) / 0.26)'
const OVERLAY: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
}
