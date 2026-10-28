import type { Stamp } from '@ldlework/crt'
import { projectPoint } from './camera'
import { morphPoint } from './morph'
import type { Vec3 } from './vec'

/*
 * One frame of the wireframe as phosphor stamps. Pure. Every sample
 * point is morphed, projected, and painted as one small dot; dots sit
 * close enough to merge into lines. Far dots are dimmer, so the back
 * of the shape reads as behind the front.
 */

/** Grid steps per cube face edge; 3 draws a 3×3 grid on each face. */
export const WIRE_DIVISIONS = 3
/** Dots along each grid line; dense enough that neighbours overlap. */
export const WIRE_SAMPLES = 64
/** Most stamps one frame may paint; also sizes the StampPass buffer. */
export const MAX_STAMPS = 4096

/** Dot edge length, in CSS px. */
const DOT_SIZE_PX = 8
/** Dot intensity at the nearest point. */
const NEAR_INTENSITY = 0.5
/** Far dots shine at this fraction of NEAR_INTENSITY. */
const FAR_FRACTION = 0.4

/** The stamps for `lines` at time `t`, on a canvas `aspect` (width / height) wide. */
export function wireStamps(lines: readonly (readonly Vec3[])[], t: number, aspect: number): Stamp[] {
  const stamps: Stamp[] = []
  for (const line of lines) {
    for (const p of line) {
      if (stamps.length >= MAX_STAMPS) return stamps
      stamps.push(dotAt(p, t, aspect))
    }
  }
  return stamps
}

function dotAt(p: Vec3, t: number, aspect: number): Stamp {
  const q = projectPoint(morphPoint(p, t), t, aspect)
  return {
    x: q.x,
    y: q.y,
    sizePx: DOT_SIZE_PX,
    intensity: NEAR_INTENSITY * (1 - (1 - FAR_FRACTION) * q.depth),
  }
}
