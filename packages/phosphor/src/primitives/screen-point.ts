export interface Point {
  x: number
  y: number
}

/** A viewport rectangle, as `getBoundingClientRect` reports it. */
export interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** An element's own layout size, before any CSS transform. */
export interface Size {
  width: number
  height: number
}

/**
 * Map a viewport point into a screen's own layout pixels. Divides out
 * any CSS scale on the screen, so the drawn pointer lands under the
 * real one on a scaled screen too.
 */
export function toScreenPoint(client: Point, box: Box, layout: Size): Point {
  const sx = box.width > 0 ? layout.width / box.width : 1
  const sy = box.height > 0 ? layout.height / box.height : 1
  return {
    x: (client.x - box.left) * sx,
    y: (client.y - box.top) * sy,
  }
}

/** True when a screen-local point lies on the glass. */
export function isOnScreen(point: Point, layout: Size): boolean {
  return point.x >= 0 && point.y >= 0 && point.x <= layout.width && point.y <= layout.height
}
