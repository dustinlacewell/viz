/*
 * The few 3D vector helpers the wireframe demo needs. Pure.
 */

export type Vec3 = readonly [number, number, number]

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

export function scale(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s]
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function length(a: Vec3): number {
  return Math.sqrt(dot(a, a))
}

/** `a` at unit length. The zero vector stays zero. */
export function normalize(a: Vec3): Vec3 {
  const len = length(a)
  return len === 0 ? a : scale(a, 1 / len)
}

/** The point `k` of the way from `a` to `b`. */
export function lerp(a: Vec3, b: Vec3, k: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
  ]
}
