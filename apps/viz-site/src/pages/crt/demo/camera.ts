import type { Vec3 } from './vec'

/*
 * The demo camera. Pure. The shape turns about Y under a fixed tilt
 * about X, so the top and bottom faces show. A perspective divide
 * follows, then x is squeezed by the canvas aspect so a cube stays a
 * cube on a wide canvas.
 */

/** Turn rate about Y, in radians per second. */
const SPIN_RAD_PER_SEC = 0.6
/** Fixed tilt about X, in radians (about 26°). */
const TILT_RAD = 0.45
/** Distance from the camera to the origin, in model units. */
const CAMERA_DISTANCE = 4.5
/** Focal scale: one model unit spans PROJECTION_SCALE / view distance in NDC. */
const PROJECTION_SCALE = 1.7
/** Radius that holds every shape; sets the depth range. */
const SCENE_RADIUS = Math.sqrt(3)

export interface Projected {
  /** NDC, -1..1. */
  x: number
  y: number
  /** 0 = nearest the camera, 1 = farthest. */
  depth: number
}

/** Where `p` lands on screen at time `t`, on a canvas `aspect` (width / height) wide. */
export function projectPoint(p: Vec3, t: number, aspect: number): Projected {
  const [x, y, z] = tilt(spin(p, t * SPIN_RAD_PER_SEC), TILT_RAD)
  const viewDist = CAMERA_DISTANCE - z
  const f = PROJECTION_SCALE / viewDist
  return {
    x: (x * f) / aspect,
    y: y * f,
    depth: clamp01((viewDist - (CAMERA_DISTANCE - SCENE_RADIUS)) / (2 * SCENE_RADIUS)),
  }
}

/** Rotate about Y by `a`. */
function spin([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [c * x + s * z, y, -s * x + c * z]
}

/** Rotate about X by `a`; positive tips the top toward the camera. */
function tilt([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [x, c * y - s * z, s * y + c * z]
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}
