import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  attach,
  defineSource,
  dial,
  registerSource,
  getSource,
  sourcesForType,
  clearRegistry,
  sampleSlot,
  sampleSource,
  sine,
  typedDial,
  type Slot,
  type SourceDef,
} from '../src'

const add = defineSource({
  name: 'test.add',
  polarity: 'bipolar',
  params: {
    a: dial(0),
    b: dial(0),
  },
  body: ({ a, b }) => a + b,
})

const counter = defineSource({
  name: 'test.counter',
  polarity: 'unipolar',
  params: {
    step: dial(1),
  },
  setup: () => {
    let n = 0
    return ({ step }) => {
      n += step
      return n
    }
  },
})

describe('defineSource()', () => {
  it('produces a callable def with the supplied metadata', () => {
    expect(typeof add).toBe('function')
    expect(add.kind).toBe('sourceDef')
    expect(add.name).toBe('test.add')
    expect(add.outType).toBe('number')
    expect(add.polarity).toBe('bipolar')
    expect(counter.polarity).toBe('unipolar')
  })

  it('carries the stdlib name and kind on the function object', () => {
    expect(sine.name).toBe('sine')
    expect(sine.kind).toBe('sourceDef')
    expect(Object.keys(sine)).toContain('name')
  })

  it('is frozen', () => {
    expect(Object.isFrozen(add)).toBe(true)
    expect(Object.isFrozen(add.params)).toBe(true)
  })

  it('keeps an explicit outType', () => {
    const s = defineSource({
      name: 'test.str',
      outType: 'string',
      polarity: 'bipolar',
      body: () => 'x',
    })
    expect(s.outType).toBe('string')
  })

  it('throws without a body or setup', () => {
    expect(() =>
      defineSource({ name: 'test.none', polarity: 'bipolar' } as never),
    ).toThrow(/test\.none/)
  })

  it('infers body param types from params', () => {
    const typed = defineSource({
      name: 'test.typed',
      outType: 'text',
      polarity: 'bipolar',
      params: { n: dial(0), s: typedDial<string>('text', 'x') },
      body: (p) => {
        expectTypeOf(p).toEqualTypeOf<{ n: number; s: string }>()
        return p.s.repeat(p.n)
      },
    })
    expectTypeOf(typed).toEqualTypeOf<SourceDef<{ n: number; s: string }, string>>()
    expectTypeOf(typed().params.n).toEqualTypeOf<Slot<number>>()
    expectTypeOf(sine().params.freq).toEqualTypeOf<Slot<number>>()
  })
})

describe('def()', () => {
  it('builds a live source with sub-slots cloned from the prototypes', () => {
    const s = add()
    expect(s.kind).toBe('source')
    expect(s.def).toBe(add)
    expect(s.params.a.kind).toBe('slot')
    expect(s.params.b.kind).toBe('slot')
    expect(s.params.a.dial.value).toBe(0)
    expect(s.params.a).not.toBe(add.params.a)
    expect(s.params.a.dial.meta).toBe(add.params.a.dial.meta)
  })

  it('gives each instance independent slots', () => {
    const a = add()
    const b = add()
    a.params.a.dial.value = 5
    expect(b.params.a.dial.value).toBe(0)
    expect(add.params.a.dial.value).toBe(0)
  })

  it('isolates stateful body closures per instance', () => {
    const c1 = counter()
    const c2 = counter()
    expect(sampleSource(c1, {})).toBe(1)
    expect(sampleSource(c1, {})).toBe(2)
    expect(sampleSource(c2, {})).toBe(1) // c2 not affected by c1
    expect(sampleSource(c1, {})).toBe(3)
  })

  it('shares stateless bodies across instances safely', () => {
    const a1 = add()
    const a2 = add()
    expect(a1.body).toBe(a2.body)
    a1.params.a.dial.value = 3
    a1.params.b.dial.value = 4
    a2.params.a.dial.value = 10
    a2.params.b.dial.value = 20
    expect(sampleSource(a1, {})).toBe(7)
    expect(sampleSource(a2, {})).toBe(30)
  })

  it('gives a prototype-attached source a fresh instance per instance', () => {
    const step = dial(0)
    attach(step, counter())
    const def = defineSource({
      name: 'test.ridesCounter',
      polarity: 'bipolar',
      params: { step },
      body: ({ step }) => step,
    })
    const a = def()
    const b = def()
    expect(a.params.step.attached).not.toBe(step.attached)
    expect(a.params.step.attached).not.toBe(b.params.step.attached)
    const first = sampleSlot(a.params.step, {})
    expect(sampleSlot(a.params.step, {})).not.toBe(first)
    // b's counter has not advanced with a's.
    expect(sampleSlot(b.params.step, {})).toBe(first)
  })
})

describe('registry', () => {
  it('registers and retrieves by name', () => {
    clearRegistry()
    registerSource(add)
    expect(getSource('test.add')).toBe(add)
  })

  it('returns undefined for unknown names', () => {
    clearRegistry()
    expect(getSource('nope')).toBeUndefined()
  })

  it('sourcesForType filters by outType', () => {
    clearRegistry()
    registerSource(add)
    const stringy = defineSource({
      name: 'test.s',
      outType: 'string',
      polarity: 'bipolar',
      body: () => 'x',
    })
    registerSource(stringy)
    const nums = sourcesForType('number')
    expect(nums).toContain(add)
    expect(nums).not.toContain(stringy)
  })

  it('re-registering replaces (HMR-safe)', () => {
    clearRegistry()
    registerSource(add)
    const replacement = defineSource({
      name: 'test.add', // same name
      polarity: 'bipolar',
      body: () => 999,
    })
    registerSource(replacement)
    expect(getSource('test.add')).toBe(replacement)
  })
})

describe('stateful per-tick guard', () => {
  it('advances once per tick — repeated samples at the same t are cached', () => {
    const c = counter()
    expect(sampleSource(c, { t: 0, dt: 1 })).toBe(1)
    expect(sampleSource(c, { t: 0, dt: 1 })).toBe(1) // no re-advance
    expect(sampleSource(c, { t: 1, dt: 1 })).toBe(2)
    expect(sampleSource(c, { t: 1, dt: 1 })).toBe(2)
  })

  it('keeps advancing per call when ctx has no numeric t', () => {
    const c = counter()
    expect(sampleSource(c, {})).toBe(1)
    expect(sampleSource(c, {})).toBe(2)
  })
})
