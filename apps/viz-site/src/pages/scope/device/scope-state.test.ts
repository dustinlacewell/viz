import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTROLS, DIVISIONS_X, NOISE_FLOOR_AMP, toScreen, toWave } from './scope-state'

describe('toWave', () => {
  it('sweeps ten divisions of the set time per division', () => {
    const wave = toWave({ ...DEFAULT_CONTROLS, timePerDivSec: 0.0005 })
    expect(DIVISIONS_X).toBe(10)
    expect(wave.sweep.sweepSec).toBeCloseTo(0.005)
  })

  it('fires at the trigger level and arms below it', () => {
    const wave = toWave({ ...DEFAULT_CONTROLS, triggerLevel: 0.3 })
    expect(wave.sweep.fireLevel).toBe(0.3)
    expect(wave.sweep.armLevel).toBeLessThan(wave.sweep.fireLevel)
  })

  it('keeps a small noise floor under tonal shapes', () => {
    expect(toWave(DEFAULT_CONTROLS).noiseFloor.amp).toBe(NOISE_FLOOR_AMP)
  })

  it('makes the noise shape all noise, at the set amplitude', () => {
    const wave = toWave({ ...DEFAULT_CONTROLS, shape: 'noise', amp: 0.7 })
    expect(wave.fundamentals).toEqual([])
    expect(wave.noiseFloor.amp).toBe(0.7)
  })

  it('carries intensity onto the beam', () => {
    expect(toWave({ ...DEFAULT_CONTROLS, intensity: 2 }).beam.intensity).toBe(2)
  })
})

describe('toScreen', () => {
  it('sets the persistence', () => {
    expect(toScreen({ ...DEFAULT_CONTROLS, persistence: 0.95 }).persistence).toBe(0.95)
  })
})
