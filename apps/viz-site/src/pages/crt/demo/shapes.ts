import { add, dot, normalize, scale, type Vec3 } from './vec'

/*
 * Where each shape puts a point of the cube surface. Pure.
 *
 * The cube keeps the point. The sphere and the pyramid push the point
 * out from the origin along its own direction until it meets their
 * surface, so the cube's grid lines stay grid lines on every shape.
 */

export type Shape = 'cube' | 'sphere' | 'pyramid'

/** A face plane of a convex polytope: the points q with n·q = d. */
export interface Face {
  n: Vec3
  d: number
}

/** Sphere radius; between the cube's inner (1) and outer (√3) radius. */
export const SPHERE_RADIUS = 1.25

/** Pyramid apex height above the origin. */
export const PYRAMID_APEX = 1.2
/** Pyramid base depth below the origin. */
export const PYRAMID_BASE = 1.05
/**
 * Half the width of the pyramid base. Base corners sit at (±H, -B, ±H),
 * under the cube's vertical edges. B ≥ H keeps every vertical-edge
 * direction on a side face, so each vertical edge lands on a side edge.
 */
export const PYRAMID_HALF_WIDTH = 1

export const PYRAMID_FACES: readonly Face[] = pyramidFaces(PYRAMID_APEX, PYRAMID_BASE, PYRAMID_HALF_WIDTH)

/** Vertical shift that centers the pyramid's bounding box on the origin. */
const PYRAMID_CENTER_SHIFT: Vec3 = [0, -(PYRAMID_APEX - PYRAMID_BASE) / 2, 0]

/** Where `shape` puts the cube surface point `p`. */
export function target(shape: Shape, p: Vec3): Vec3 {
  if (shape === 'sphere') return scale(normalize(p), SPHERE_RADIUS)
  if (shape === 'pyramid') return add(radialProject(normalize(p), PYRAMID_FACES), PYRAMID_CENTER_SHIFT)
  return p
}

/**
 * The point s·dir on the surface of the convex polytope `faces`, which
 * must contain the origin. The ray leaves through the nearest face it
 * moves toward: s = min of d / (n·dir) over faces with n·dir > 0.
 */
export function radialProject(dir: Vec3, faces: readonly Face[]): Vec3 {
  let s = Infinity
  for (const f of faces) {
    const along = dot(f.n, dir)
    if (along > 0) s = Math.min(s, f.d / along)
  }
  return scale(dir, s)
}

/**
 * Base plane plus four side planes. A side plane holds the apex
 * (0, a, 0) and the base edge at x = h; its normal is ∝ ((a + b) / h, 1, 0).
 */
function pyramidFaces(a: number, b: number, h: number): Face[] {
  const slope = (a + b) / h
  const sides: Vec3[] = [[slope, 1, 0], [-slope, 1, 0], [0, 1, slope], [0, 1, -slope]]
  return [
    { n: [0, -1, 0], d: b },
    ...sides.map((raw) => face(raw, a)),
  ]
}

/** A face with normal `raw` through the apex height `a`, at unit normal. */
function face(raw: Vec3, a: number): Face {
  const n = normalize(raw)
  return { n, d: a * n[1] }
}
