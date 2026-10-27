import type { CSSProperties, HTMLAttributes } from 'react'

interface EmbeddedScreenProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Inset of the on-glass content from the screen edge. Same contract
   * as Display's `padding`: omit it to bleed content to the edge, or
   * pass e.g. `16` for text and controls.
   */
  padding?: number | string
  /**
   * The screen's emitted color — any CSS color expression. Drives the
   * rim catch, body tint and spill of THIS screen. When omitted, the
   * screen inherits `--display-color` from the cascade (the page theme
   * accent). Pass a color to hue-lock this screen regardless of theme.
   */
  color?: string
}

/**
 * A screen recessed straight into its host Panel — no Lip, no Bezel.
 * Use it when a screen sits on a device face beside other controls;
 * use Display when the screen is a chassis of its own.
 *
 * Built on `.screen-embedded`, which carries the Screen's spill and a
 * single chamfer recipe for the glass↔chrome interface. Any on-glass
 * content class (`.screen-row`, `.screen-chip`, …) works inside it.
 */
export function EmbeddedScreen({
  padding,
  color,
  className = '',
  style,
  ...rest
}: EmbeddedScreenProps) {
  const mergedStyle: CSSProperties = {
    ...(padding !== undefined ? { padding } : {}),
    ...(color !== undefined ? { ['--display-color' as string]: color } : {}),
    ...style,
  }
  return (
    <div {...rest} style={mergedStyle} className={`screen-embedded ${className}`} />
  )
}

export type { EmbeddedScreenProps }
