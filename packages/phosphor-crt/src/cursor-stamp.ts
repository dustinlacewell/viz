import type { Stamp } from '@ldlework/crt'
import { CURSOR_ARROW, type ScreenPointerSample } from '@ldlework/phosphor'

/**
 * The arrow texture is square, its edge the arrow box's longer side,
 * with the arrow box in its top-left corner.
 */
export const CURSOR_SQUARE_PX = Math.max(CURSOR_ARROW.width, CURSOR_ARROW.height)

/**
 * The stamp that draws the arrow with its tip on the mouse. A stamp is
 * placed by its centre in GL coordinates (-1..1, y up) and sized in
 * framebuffer pixels; the sample is in the screen's CSS pixels.
 * Returns null for a screen with no size.
 */
export function cursorStamp(
  sample: ScreenPointerSample,
  fboWidth: number,
  intensity: number,
): Stamp | null {
  if (sample.width <= 0 || sample.height <= 0) return null
  const half = CURSOR_SQUARE_PX / 2
  const cx = sample.x - CURSOR_ARROW.inset + half
  const cy = sample.y - CURSOR_ARROW.inset + half
  return {
    x: (cx / sample.width) * 2 - 1,
    y: 1 - (cy / sample.height) * 2,
    sizePx: CURSOR_SQUARE_PX * (fboWidth / sample.width),
    intensity,
  }
}
