import { describe, expect, it } from 'vitest'
import { projectPoint } from './camera'

describe('projectPoint', () => {
  it('keeps the center at the center', () => {
    for (const t of [0, 1.3, 7]) {
      const q = projectPoint([0, 0, 0], t, 1.8)
      expect(q.x).toBeCloseTo(0, 12)
      expect(q.y).toBeCloseTo(0, 12)
    }
  })

  it('orders near before far', () => {
    // At t = 0 there is no spin; +z faces the camera.
    const near = projectPoint([0, 0, 1], 0, 1)
    const far = projectPoint([0, 0, -1], 0, 1)
    expect(near.depth).toBeLessThan(far.depth)
    expect(near.depth).toBeGreaterThanOrEqual(0)
    expect(far.depth).toBeLessThanOrEqual(1)
  })

  it('squeezes x by the canvas aspect', () => {
    const square = projectPoint([1, 0, 0], 0, 1)
    const wide = projectPoint([1, 0, 0], 0, 2)
    expect(wide.x).toBeCloseTo(square.x / 2, 12)
    expect(wide.y).toBeCloseTo(square.y, 12)
  })
})
