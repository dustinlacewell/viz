import { describe, expect, it } from 'vitest'
import { cubeWireframe } from './wireframe'

describe('cubeWireframe', () => {
  const lines = cubeWireframe(3, 16)

  it('puts every point on the cube surface', () => {
    for (const p of lines.flat()) {
      expect(Math.max(...p.map(Math.abs))).toBeCloseTo(1, 12)
    }
  })

  it('samples each line at the asked density', () => {
    for (const line of lines) expect(line).toHaveLength(16)
  })

  it('draws each surface line once', () => {
    // 3 axes × 4·divisions boundary grid positions.
    expect(lines).toHaveLength(3 * 4 * 3)
  })

  it('includes all 12 cube edges, end to end', () => {
    for (let axis = 0; axis < 3; axis++) {
      const [u, v] = [0, 1, 2].filter((a) => a !== axis) as [number, number]
      for (const su of [-1, 1]) {
        for (const sv of [-1, 1]) {
          const edge = lines.find((line) => line.every((p) => p[u] === su && p[v] === sv))
          expect(edge, `edge axis ${axis} at ${su},${sv}`).toBeDefined()
          expect(edge![0]![axis]).toBe(-1)
          expect(edge![edge!.length - 1]![axis]).toBe(1)
        }
      }
    }
  })
})
