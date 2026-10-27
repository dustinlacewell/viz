import { describe, expect, it } from 'vitest'
import { logPosition, logValue } from '../src/primitives/log-scale'

describe('logValue', () => {
  it('maps the ends and the middle geometrically', () => {
    expect(logValue(0, 1, 100)).toBeCloseTo(1)
    expect(logValue(1, 1, 100)).toBeCloseTo(100)
    expect(logValue(0.5, 1, 100)).toBeCloseTo(10)
  })

  it('snaps the value, not the position, to step', () => {
    // pos 0.3 → 10^0.6 ≈ 3.98 → step 1 → 4.
    expect(logValue(0.3, 1, 100, 1)).toBe(4)
    // pos 0.5 → 10 → step 0.25 stays on a multiple.
    expect(logValue(0.51, 1, 100, 0.25) % 0.25).toBeCloseTo(0)
  })

  it('clamps a snapped value into the range', () => {
    // pos 0 → 0.3 → step 1 rounds to 0, below min.
    expect(logValue(0, 0.3, 10, 1)).toBe(0.3)
    // pos 1 → 10.5 → step 3 rounds to 12, above max.
    expect(logValue(1, 1, 10.5, 3)).toBe(10.5)
  })

  it('is continuous without step', () => {
    expect(logValue(0.3, 1, 100)).toBeCloseTo(10 ** 0.6)
  })
})

describe('logPosition', () => {
  it('inverts logValue', () => {
    expect(logPosition(logValue(0.37, 2, 2000), 2, 2000)).toBeCloseTo(0.37)
  })

  it('pins values below min to position 0', () => {
    expect(logPosition(0, 1, 100)).toBe(0)
  })
})
