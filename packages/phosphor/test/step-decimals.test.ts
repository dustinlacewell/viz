import { describe, expect, it } from 'vitest'
import { stepDecimals } from '../src/primitives/step-decimals'

describe('stepDecimals', () => {
  it('counts the decimals a step needs', () => {
    expect(stepDecimals(1)).toBe(0)
    expect(stepDecimals(5)).toBe(0)
    expect(stepDecimals(0.1)).toBe(1)
    expect(stepDecimals(0.25)).toBe(2)
    expect(stepDecimals(0.001)).toBe(3)
  })

  it('ignores float noise in the step', () => {
    expect(stepDecimals(0.07)).toBe(2)
    expect(stepDecimals(0.1 + 0.2)).toBe(1)
  })

  it('caps at 4', () => {
    expect(stepDecimals(0.0001)).toBe(4)
    expect(stepDecimals(1e-7)).toBe(4)
    expect(stepDecimals(1 / 3)).toBe(4)
  })
})
