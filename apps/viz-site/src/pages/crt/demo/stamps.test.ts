import { describe, expect, it } from 'vitest'
import { MAX_STAMPS, WIRE_DIVISIONS, WIRE_SAMPLES, wireStamps } from './stamps'
import { cubeWireframe } from './wireframe'

describe('wireStamps', () => {
  it('paints one stamp per sample, within the budget', () => {
    const lines = cubeWireframe(WIRE_DIVISIONS, WIRE_SAMPLES)
    const stamps = wireStamps(lines, 0, 1.6)
    expect(stamps).toHaveLength(lines.flat().length)
    expect(stamps.length).toBeLessThanOrEqual(MAX_STAMPS)
  })

  it('stops at the budget', () => {
    const lines = cubeWireframe(WIRE_DIVISIONS, MAX_STAMPS)
    expect(wireStamps(lines, 0, 1)).toHaveLength(MAX_STAMPS)
  })
})
