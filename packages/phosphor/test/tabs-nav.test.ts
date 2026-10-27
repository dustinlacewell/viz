import { describe, expect, it } from 'vitest'
import { nextEnabledIndex } from '../src/primitives/tabs-nav'

describe('nextEnabledIndex', () => {
  it('steps to the neighbour in either direction', () => {
    const d = [false, false, false]
    expect(nextEnabledIndex(d, 1, 1)).toBe(2)
    expect(nextEnabledIndex(d, 1, -1)).toBe(0)
  })

  it('skips disabled tabs', () => {
    const d = [false, true, true, false]
    expect(nextEnabledIndex(d, 0, 1)).toBe(3)
    expect(nextEnabledIndex(d, 3, -1)).toBe(0)
  })

  it('wraps at both ends', () => {
    const d = [false, false, false]
    expect(nextEnabledIndex(d, 2, 1)).toBe(0)
    expect(nextEnabledIndex(d, 0, -1)).toBe(2)
  })

  it('wraps past disabled tabs at the ends', () => {
    const d = [true, false, false, true]
    expect(nextEnabledIndex(d, 2, 1)).toBe(1)
    expect(nextEnabledIndex(d, 1, -1)).toBe(2)
  })

  it('finds first and last enabled from one past either end', () => {
    const d = [true, false, false, true]
    expect(nextEnabledIndex(d, -1, 1)).toBe(1)
    expect(nextEnabledIndex(d, d.length, -1)).toBe(2)
  })

  it('returns the start when it is the only enabled tab', () => {
    expect(nextEnabledIndex([true, false, true], 1, 1)).toBe(1)
  })

  it('returns -1 when every tab is disabled', () => {
    expect(nextEnabledIndex([true, true], 0, 1)).toBe(-1)
    expect(nextEnabledIndex([true, true], -1, 1)).toBe(-1)
  })

  it('returns -1 for an empty list', () => {
    expect(nextEnabledIndex([], -1, 1)).toBe(-1)
  })
})
