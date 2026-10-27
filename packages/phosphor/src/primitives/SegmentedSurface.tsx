import type { CSSProperties, ReactNode } from 'react'
import { Display, type DisplayProps } from './Display'

interface SegmentedSurfaceProps
  extends Omit<DisplayProps, 'children' | 'raised' | 'bezel' | 'padding' | 'color' | 'fill' | 'screenStyle' | 'screenClassName'> {
  /**
   * The lit-segment content (foreground). Anything you can render in
   * React — segmented digits, weather glyphs, an inline SVG, multiple
   * spans with different fonts mixed together. Sits in front,
   * inheriting the display's emitted color + glow.
   */
  lit: ReactNode
  /**
   * Optional dim layer rendered behind `lit` in the display's dim
   * color. Stacks in the same grid cell so it's drawn at the same
   * position as the lit content — use to render the unlit-segment
   * ghost beneath a partial reading, or any other "depth" content.
   */
  ghost?: ReactNode
  /**
   * Pixel offset for the ghost layer relative to the lit layer.
   * Small values (e.g. `{ x: 1, y: 1 }`) give a depth-displaced
   * shadow read. Default `{ x: 0, y: 0 }`.
   */
  ghostOffset?: { x?: number; y?: number }
  /**
   * The display's emitted color — any CSS color expression (hex,
   * rgb(), oklch(), keyword). Drives the entire chamfer family for
   * THIS display: rim catch, body tint, spill, bezel rim, and the
   * lit/ghost glyph color all derive from this one value.
   *
   * When omitted, the display inherits `--display-color` from the
   * cascade (defaults to the page theme accent). Pass a color when
   * you want this particular display hue-locked regardless of the
   * surrounding theme — e.g. a green clock that stays green on a
   * blue-themed page.
   */
  color?: string
}

/**
 * A two-layer bare recessed Display: a small piece of glass with a
 * lit foreground and an optional ghost layer behind it. Mounted
 * directly on a Panel, with no chassis or bezel of its own.
 *
 * SegmentedDisplay is a text-specialised version of this; build your
 * own specialisations (weather glyphs, multi-font readouts, mixed
 * content) by composing arbitrary ReactNodes into `lit` and `ghost`.
 */
export function SegmentedSurface({
  lit,
  ghost,
  ghostOffset,
  className = '',
  ...rest
}: SegmentedSurfaceProps) {
  const ghostStyle: CSSProperties | undefined =
    ghostOffset && (ghostOffset.x || ghostOffset.y)
      ? { transform: `translate(${ghostOffset.x ?? 0}px, ${ghostOffset.y ?? 0}px)` }
      : undefined
  return (
    <Display {...rest} raised={false} bezel={false} className={`segdisplay ${className}`}>
      {ghost !== undefined && (
        <div
          className="segdisplay-ghost"
          aria-hidden="true"
          style={ghostStyle}
        >
          {ghost}
        </div>
      )}
      <div className="segdisplay-lit">{lit}</div>
    </Display>
  )
}

export type { SegmentedSurfaceProps }
