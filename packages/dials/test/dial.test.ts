import { describe, expect, it } from 'vitest'
import {
  attach,
  cloneSlot,
  defineSource,
  dial,
  fromJSON,
  rebaseSlot,
  sampleSlot,
  getPos,
  setDial,
  setPos,
  sine,
  toJSON,
  typedDial,
} from '../src'

const one = defineSource({
  name: 'test.one',
  polarity: 'bipolar',
  body: () => 1,
})

describe('dial()', () => {
  it('creates a numeric slot with type tag "number"', () => {
    const s = dial(0.5)
    expect(s.kind).toBe('slot')
    expect(s.outType).toBe('number')
    expect(s.dial.kind).toBe('dial')
    expect(s.dial.value).toBe(0.5)
    expect(s.attached).toBeNull()
  })

  it('carries metadata verbatim', () => {
    const s = dial(2, { min: 0, max: 10, step: 0.5, label: 'two' })
    expect(s.dial.meta).toEqual({ min: 0, max: 10, step: 0.5, label: 'two' })
  })

  it('omits meta defaults to an empty object', () => {
    const s = dial(0)
    expect(s.dial.meta).toEqual({})
  })
})

describe('dial() with construction-time modulation', () => {
  it('attaches mod and samples modulated; meta holds no slot state', () => {
    const s = dial(0.5, { min: 0, max: 1, mod: one(), depth: 0.25 })
    expect(s.attached?.def).toBe(one)
    expect(s.modDepth).toBe(0.25)
    expect(sampleSlot(s, {})).toBeCloseTo(0.75)
    expect(s.dial.meta).toEqual({ min: 0, max: 1 })
  })

  it('seeds the default depth when depth is not given', () => {
    const s = dial(0.5, { min: 0, max: 1, mod: one() })
    expect(s.modDepth).toBeGreaterThan(0)
  })

  it('keeps an explicit depth of 0 with a mod', () => {
    const s = dial(0.5, { min: 0, max: 1, mod: one(), depth: 0 })
    expect(s.attached).not.toBeNull()
    expect(s.modDepth).toBe(0)
    expect(sampleSlot(s, {})).toBe(0.5)
  })

  it('applies mode and glide', () => {
    const s = dial(0.5, { min: 0, max: 1, mod: one(), depth: 0.2, mode: 'down', glide: 1.5 })
    expect(s.modMode).toBe('down')
    expect(s.glide).toBe(1.5)
    expect(sampleSlot(s, {})).toBeCloseTo(0.3)
  })

  it('arms depth and mode with no mod', () => {
    const s = dial(0, { depth: 0.4, mode: 'up' })
    expect(s.attached).toBeNull()
    expect(s.modDepth).toBe(0.4)
    expect(s.modMode).toBe('up')
  })

  it('throws when mod is given to a non-modulatable dial', () => {
    expect(() => dial(0, { modulatable: false, mod: one() })).toThrow(/modulatable/)
  })

  it('throws when mod has the wrong outType', () => {
    const text = defineSource({
      name: 'test.text',
      outType: 'text',
      polarity: 'bipolar',
      body: () => 'x',
    })
    expect(() => dial(0, { mod: text() as never })).toThrow(/test\.text/)
  })

  it('typedDial takes a mod too', () => {
    const text = defineSource({
      name: 'test.text2',
      outType: 'text',
      polarity: 'bipolar',
      body: () => 'from-source',
    })
    const s = typedDial<string>('text', 'base', { mod: text() })
    expect(sampleSlot(s, {})).toBe('from-source')
  })

  it('cloneSlot copies a construction-time mod as a fresh instance', () => {
    const s = dial(0.5, { min: 0, max: 1, mod: sine({ freq: 3 }), depth: 0.3, mode: 'up' })
    const c = cloneSlot(s)
    expect(c.attached).not.toBe(s.attached)
    expect(c.attached?.def).toBe(sine)
    expect(c.attached?.params['freq']?.dial.value).toBe(3)
    expect(c.modDepth).toBe(0.3)
    expect(c.modMode).toBe('up')
  })

  it('round-trips a construction-time mod through toJSON / fromJSON', () => {
    const d = { f: dial(1, { min: 0, max: 2, mod: sine({ freq: 3 }), depth: 0.3, mode: 'up' }) }
    const fresh = { f: dial(1, { min: 0, max: 2 }) }
    fromJSON(fresh, JSON.parse(JSON.stringify(toJSON(d))))
    expect(fresh.f.attached?.def).toBe(sine)
    expect(fresh.f.attached?.params['freq']?.dial.value).toBe(3)
    expect(fresh.f.modDepth).toBe(0.3)
    expect(fresh.f.modMode).toBe('up')
  })
})

describe('typedDial()', () => {
  it('tags the slot with the caller-supplied type', () => {
    const s = typedDial<[number, number, number]>('rgb', [1, 0, 0])
    expect(s.outType).toBe('rgb')
    expect(s.dial.value).toEqual([1, 0, 0])
  })
})

describe('setPos() / getPos()', () => {
  it('maps 0..1 onto a linear range', () => {
    const s = dial(0, { min: 10, max: 20 })
    setPos(s, 0.5)
    expect(s.dial.value).toBe(15)
    expect(getPos(s)).toBe(0.5)
  })

  it('follows a log scale', () => {
    const s = dial(1, { min: 1, max: 100, scale: 'log' })
    setPos(s, 0.5)
    expect(s.dial.value).toBeCloseTo(10)
    expect(getPos(s)).toBeCloseTo(0.5)
  })

  it('clamps positions outside 0..1', () => {
    const s = dial(0, { min: 0, max: 1 })
    setPos(s, 2)
    expect(s.dial.value).toBe(1)
  })

  it('throws when the dial has no range', () => {
    const s = dial(0, { min: 0 })
    expect(() => setPos(s, 0.5)).toThrow(/no min\/max range/)
    expect(() => getPos(s)).toThrow(/no min\/max range/)
  })
})

describe('setDial()', () => {
  it('writes through to dial.value', () => {
    const s = dial(0)
    setDial(s, 0.7)
    expect(s.dial.value).toBe(0.7)
  })

  it('clamps numbers when min/max are both defined', () => {
    const s = dial(0, { min: 0, max: 1 })
    setDial(s, -5)
    expect(s.dial.value).toBe(0)
    setDial(s, 5)
    expect(s.dial.value).toBe(1)
  })

  it('does not clamp when only min is defined', () => {
    const s = dial(0, { min: 0 })
    setDial(s, -5)
    expect(s.dial.value).toBe(-5)
  })

  it('does not clamp non-number values', () => {
    const s = typedDial<string>('text', 'hi')
    setDial(s, 'bye')
    expect(s.dial.value).toBe('bye')
  })
})

describe('rebaseSlot()', () => {
  it('makes the current value the reset target', () => {
    const s = dial(3, { min: 0, max: 10 })
    setDial(s, 7)
    expect(s.dial.initial).toBe(3)
    rebaseSlot(s)
    expect(s.dial.initial).toBe(7)
  })

  it('recurses through an attached source\'s sub-slots', () => {
    const s = dial(0, { min: -1, max: 1 })
    const src = attach(s, sine())
    src.params.freq.dial.value = 4.2
    rebaseSlot(s)
    expect(src.params.freq.dial.initial).toBe(4.2)
  })

  it('survives cloning — a clone of a rebased slot keeps the new home', () => {
    const s = dial(3, { min: 0, max: 10 })
    setDial(s, 7)
    rebaseSlot(s)
    expect(cloneSlot(s).dial.initial).toBe(7)
  })
})
