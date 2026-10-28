import { describe, expect, it } from 'vitest'
import { MAX_HARMONIC_HZ, MAX_HARMONICS, shapeFundamentals } from './waveform'

describe('shapeFundamentals', () => {
  it('builds a sine from one term', () => {
    expect(shapeFundamentals('sine', 440, 0.5)).toEqual([{ freq: 440, amp: 0.5, phase: 0 }])
  })

  it('builds a square from odd harmonics at 1/n amplitude', () => {
    const terms = shapeFundamentals('square', 100, 1)
    const first = terms[0]!
    for (const t of terms) {
      const n = Math.round(t.freq / 100)
      expect(n % 2).toBe(1)
      expect(t.amp).toBeCloseTo(first.amp / n)
      expect(t.phase).toBe(0)
    }
  })

  it('builds a saw from every harmonic, flipping the even ones', () => {
    const terms = shapeFundamentals('saw', 100, 1)
    expect(terms.map((t) => Math.round(t.freq / 100))).toEqual(terms.map((_, i) => i + 1))
    for (const [i, t] of terms.entries()) {
      expect(t.amp).toBeGreaterThan(0)
      expect(t.phase).toBe((i + 1) % 2 === 0 ? Math.PI : 0)
    }
  })

  it('caps the harmonic count', () => {
    expect(shapeFundamentals('square', 20, 1)).toHaveLength(MAX_HARMONICS)
    expect(shapeFundamentals('saw', 20, 1)).toHaveLength(MAX_HARMONICS)
  })

  it('drops harmonics above the frequency cutoff', () => {
    const terms = shapeFundamentals('saw', 5000, 1)
    expect(terms.every((t) => t.freq <= MAX_HARMONIC_HZ)).toBe(true)
    expect(terms).toHaveLength(Math.floor(MAX_HARMONIC_HZ / 5000))
  })

  it('gives noise no terms', () => {
    expect(shapeFundamentals('noise', 440, 1)).toEqual([])
  })
})
