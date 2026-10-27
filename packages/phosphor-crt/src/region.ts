/** A viewport rectangle, as `getBoundingClientRect` reports it. */
export interface Box {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Where an HTML box sits on the CRT. `left`..`right` and
 * `bottom`..`top` are GL coordinates (-1..1, y up); `width` and
 * `height` are its size in CSS pixels, for spacing things inside it.
 */
export interface CrtRegionRect {
  left: number
  right: number
  bottom: number
  top: number
  width: number
  height: number
}

/** Map a box into GL coordinates of the CRT that covers `crt`. */
export function regionToNdc(box: Box, crt: Box): CrtRegionRect | null {
  if (crt.width <= 0 || crt.height <= 0) return null
  const x = (px: number) => ((px - crt.left) / crt.width) * 2 - 1
  const y = (px: number) => 1 - ((px - crt.top) / crt.height) * 2
  return {
    left: x(box.left),
    right: x(box.left + box.width),
    top: y(box.top),
    bottom: y(box.top + box.height),
    width: box.width,
    height: box.height,
  }
}
