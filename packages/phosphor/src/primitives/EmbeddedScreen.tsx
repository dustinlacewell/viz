import type { CSSProperties, HTMLAttributes } from 'react'
import { ScreenCursor } from './ScreenCursor'

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
  /**
   * Frame the glass in the black Bezel ring, as a Display does. Off,
   * the glass meets the chrome directly through a single chamfer —
   * right for small readouts; on suits a main screen.
   */
  bezel?: boolean
  /**
   * Draw a lit pointer on the glass and hide the system cursor over
   * it. Same contract as Display's `cursor`.
   */
  cursor?: boolean
}

/**
 * A screen recessed straight into its host Panel — no raised Lip.
 * Use it when a screen sits on a device face beside other controls;
 * use Display when the screen is a chassis of its own.
 *
 * Bare, it is `.screen-embedded`: the Screen's spill plus one chamfer
 * recipe for the glass↔chrome interface. With `bezel`, it is a Bezel
 * around a Screen, whose outset rim effects land on the host chrome.
 * Any on-glass content class (`.screen-row`, `.screen-chip`, …) works
 * inside either.
 */
export function EmbeddedScreen({
  padding,
  color,
  bezel = false,
  cursor = false,
  className = '',
  style,
  children,
  ...rest
}: EmbeddedScreenProps) {
  const colorStyle: CSSProperties =
    color !== undefined ? { ['--display-color' as string]: color } : {}
  const paddingStyle: CSSProperties = padding !== undefined ? { padding } : {}

  if (!bezel) {
    return (
      <div
        {...rest}
        style={{ ...paddingStyle, ...colorStyle, ...style }}
        className={`screen-embedded ${className}`}
      >
        <ScreenCursor enabled={cursor}>{children}</ScreenCursor>
      </div>
    )
  }
  return (
    <div {...rest} style={{ ...colorStyle, ...style }} className={`bezel ${className}`}>
      <div className="screen" style={{ flex: 1, ...paddingStyle }}>
        <ScreenCursor enabled={cursor}>{children}</ScreenCursor>
      </div>
    </div>
  )
}

export type { EmbeddedScreenProps }
