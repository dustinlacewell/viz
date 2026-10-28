import { describe, expect, it } from 'vitest'
import { formatHz, formatLevel, formatShape, formatTimePerDiv } from './readouts'

describe('readouts', () => {
  it('formats frequency', () => {
    expect(formatHz(440)).toBe('440 Hz')
    expect(formatHz(1200)).toBe('1.20 kHz')
    expect(formatHz(999.7)).toBe('1.00 kHz')
  })

  it('formats time per division', () => {
    expect(formatTimePerDiv(0.001)).toBe('1.00 ms/div')
    expect(formatTimePerDiv(0.00025)).toBe('250 µs/div')
  })

  it('formats a signed level', () => {
    expect(formatLevel(0.25)).toBe('+0.25')
    expect(formatLevel(-0.4)).toBe('-0.40')
    expect(formatLevel(0)).toBe('0.00')
    expect(formatLevel(-0.001)).toBe('0.00')
  })

  it('names the shape', () => {
    expect(formatShape('saw')).toBe('Saw')
  })
})
