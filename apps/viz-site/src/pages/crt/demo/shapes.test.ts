import { describe, expect, it } from 'vitest'
import { PYRAMID_FACES, SPHERE_RADIUS, radialProject, target } from './shapes'
import { dot, length, normalize, type Vec3 } from './vec'
import { cubeWireframe } from './wireframe'

/** Largest n·q − d over the faces: 0 on the surface, < 0 inside. */
function surfaceGap(q: Vec3): number {
  return Math.max(...PYRAMID_FACES.map((f) => dot(f.n, q) - f.d))
}

/** Faces that `q` lies on. */
function facesHit(q: Vec3): number {
  return PYRAMID_FACES.filter((f) => Math.abs(dot(f.n, q) - f.d) < 1e-9).length
}

const points = cubeWireframe(3, 9).flat()

describe('target', () => {
  it('keeps cube points where they are', () => {
    expect(target('cube', [1, -0.5, 0.25])).toEqual([1, -0.5, 0.25])
  })

  it('puts sphere points at the sphere radius', () => {
    for (const p of points) expect(length(target('sphere', p))).toBeCloseTo(SPHERE_RADIUS, 12)
  })
})

describe('radialProject', () => {
  it('lands every cube direction on the pyramid surface', () => {
    for (const p of points) {
      expect(surfaceGap(radialProject(normalize(p), PYRAMID_FACES))).toBeCloseTo(0, 12)
    }
  })

  it('maps a cube vertical edge onto a pyramid side edge', () => {
    for (const y of [-1, -0.5, 0, 0.5, 1]) {
      const q = radialProject(normalize([1, y, 1]), PYRAMID_FACES)
      // A side edge is where two side faces meet; the base is not one of them.
      expect(facesHit(q), `y = ${y}`).toBe(2)
      expect(dot(PYRAMID_FACES[0]!.n, q) - PYRAMID_FACES[0]!.d).toBeLessThan(0)
    }
  })
})
