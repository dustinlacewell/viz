import type { Vec3 } from './vec'

/*
 * Grid lines on the surface of the cube [-1, 1]³. Pure.
 *
 * Each line runs along one axis. Its other two coordinates sit on a
 * grid of `divisions + 1` steps from -1 to 1, and the line is on the
 * surface when at least one of them is ±1. Built this way, a line
 * shared by two faces (a cube edge) appears once, so no edge draws
 * twice as bright.
 */

/** Polylines covering the cube surface; each holds `samplesPerEdge` points. */
export function cubeWireframe(divisions: number, samplesPerEdge: number): Vec3[][] {
  const lines: Vec3[][] = []
  for (let axis = 0; axis < 3; axis++) {
    for (let i = 0; i <= divisions; i++) {
      for (let j = 0; j <= divisions; j++) {
        if (!onBoundary(i, divisions) && !onBoundary(j, divisions)) continue
        lines.push(gridLine(axis, gridValue(i, divisions), gridValue(j, divisions), samplesPerEdge))
      }
    }
  }
  return lines
}

function onBoundary(i: number, divisions: number): boolean {
  return i === 0 || i === divisions
}

function gridValue(i: number, divisions: number): number {
  return -1 + (2 * i) / divisions
}

/** A line along `axis`, with the other two axes (in order) fixed at `u`, `v`. */
function gridLine(axis: number, u: number, v: number, samples: number): Vec3[] {
  const points: Vec3[] = []
  for (let s = 0; s < samples; s++) {
    const w = -1 + (2 * s) / (samples - 1)
    points.push(place(axis, w, u, v))
  }
  return points
}

function place(axis: number, w: number, u: number, v: number): Vec3 {
  if (axis === 0) return [w, u, v]
  if (axis === 1) return [u, w, v]
  return [u, v, w]
}
