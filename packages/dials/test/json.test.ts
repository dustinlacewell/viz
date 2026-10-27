import { afterEach, describe, expect, it } from 'vitest'
import {
  attach,
  DEFAULT_DEPTH,
  defineSource,
  dial,
  fromJSON,
  read,
  registerSource,
  registerStdlib,
  setDepth,
  setGlide,
  setMode,
  toJSON,
  sine,
  clearRegistry,
  type DialsSnap,
} from '../src'

// Stdlib is needed for the round-trip tests that use sine by name.
afterEach(() => {
  clearRegistry()
  registerStdlib()
})

describe('toJSON()', () => {
  it('snapshots a bare dials object with its slot-level depth, mode, and glide', () => {
    const d = { a: dial(1), b: dial(2, { min: 0, max: 10 }) }
    expect(toJSON(d)).toEqual({
      a: { value: 1, depth: 0, mode: 'center', glide: 0 },
      b: { value: 2, depth: 0, mode: 'center', glide: 0 },
    })
  })

  it('snapshots depth, mode, and glide for an armed-but-unattached slot', () => {
    const d = { freq: dial(600) }
    setDepth(d.freq, 0.3)
    setMode(d.freq, 'up')
    setGlide(d.freq, 1.5)
    expect(toJSON(d).freq).toEqual({ value: 600, depth: 0.3, mode: 'up', glide: 1.5 })
  })

  it('snapshots an attached source with slot depth/mode and sub-slot values', () => {
    const d = { freq: dial(600) }
    const src = sine()
    src.params.freq.dial.value = 0.3
    src.params.phase.dial.value = 0
    attach(d.freq, src)
    setDepth(d.freq, 0.4)
    expect(toJSON(d)).toEqual({
      freq: {
        value: 600,
        depth: 0.4,
        mode: 'center',
        glide: 0,
        attached: {
          name: 'sine',
          params: {
            freq: { value: 0.3, depth: 0, mode: 'center', glide: 0 },
            phase: { value: 0, depth: 0, mode: 'center', glide: 0 },
          },
        },
      },
    })
  })

  it('snapshots nested modulation (depth-2)', () => {
    const d = { freq: dial(600) }
    const outer = sine()
    const inner = sine()
    attach(d.freq, outer)
    attach(outer.params.freq, inner)
    setDepth(outer.params.freq, 0.2)
    const snap = toJSON(d)
    expect(snap.freq?.attached?.name).toBe('sine')
    // A bare attach seeds DEFAULT_DEPTH onto the host slot.
    expect(snap.freq?.depth).toBe(DEFAULT_DEPTH)
    expect(snap.freq?.attached?.params.freq?.attached?.name).toBe('sine')
    expect(snap.freq?.attached?.params.freq?.depth).toBe(0.2)
  })
})

describe('fromJSON()', () => {
  it('round-trips a bare dials object', () => {
    const d = { a: dial(0), b: dial(0) }
    fromJSON(d, { a: { value: 5 }, b: { value: 10 } })
    expect(read(d, {})).toEqual({ a: 5, b: 10 })
  })

  it('round-trips an attached source with its slot-level depth', () => {
    const d = { freq: dial(600) }
    const src = sine()
    src.params.freq.dial.value = 0.5
    src.params.phase.dial.value = 1.5
    attach(d.freq, src)
    setDepth(d.freq, 0.35)
    const snap = toJSON(d)

    // hydrate a fresh copy
    const fresh = { freq: dial(600) }
    fromJSON(fresh, snap)
    expect(fresh.freq.attached).not.toBeNull()
    expect(fresh.freq.attached!.def.name).toBe('sine')
    expect(fresh.freq.modDepth).toBe(0.35)
    expect(fresh.freq.attached!.params.freq.dial.value).toBe(0.5)
    expect(fresh.freq.attached!.params.phase.dial.value).toBe(1.5)
  })

  it('round-trips depth with nothing attached', () => {
    const d = { freq: dial(600) }
    setDepth(d.freq, 0.42)
    const snap = toJSON(d)
    const fresh = { freq: dial(600) }
    fromJSON(fresh, snap)
    expect(fresh.freq.attached).toBeNull()
    expect(fresh.freq.modDepth).toBe(0.42)
  })

  it('preserves an explicit snapshot depth of 0 even with a source attached', () => {
    // The attach-time seeding must NOT clobber a snapshot's explicit 0 —
    // depth is applied after the attach on load.
    const snap = {
      freq: {
        value: 600,
        depth: 0,
        attached: { name: 'sine', params: {} },
      },
    } as unknown as DialsSnap
    const d = { freq: dial(600) }
    fromJSON(d, snap)
    expect(d.freq.attached).not.toBeNull()
    expect(d.freq.modDepth).toBe(0)
  })

  it('round-trips the slot-level modulation mode', () => {
    const d = { freq: dial(600) }
    const src = sine()
    attach(d.freq, src)
    setMode(d.freq, 'down')
    setDepth(d.freq, 0.3)
    const snap = toJSON(d)
    expect(snap.freq?.mode).toBe('down')

    const fresh = { freq: dial(600) }
    fromJSON(fresh, snap)
    expect(fresh.freq.modMode).toBe('down')
  })

  it('round-trips mode for an armed-but-unattached slot', () => {
    const d = { freq: dial(600) }
    setMode(d.freq, 'up')
    setDepth(d.freq, 0.5)
    const snap = toJSON(d)
    const fresh = { freq: dial(600) }
    fromJSON(fresh, snap)
    expect(fresh.freq.attached).toBeNull()
    expect(fresh.freq.modMode).toBe('up')
    expect(fresh.freq.modDepth).toBe(0.5)
  })

  it("leaves the slot's default mode when the snapshot has none", () => {
    // A pre-mode snapshot (older wire format) leaves the slot's own
    // 'center' default.
    const legacy = {
      freq: {
        value: 600,
        attached: { name: 'sine', params: {} },
      },
    } as unknown as DialsSnap
    const d = { freq: dial(600) }
    fromJSON(d, legacy)
    expect(d.freq.modMode).toBe('center')
  })

  it('seeds DEFAULT_DEPTH when the snapshot has no depth', () => {
    // A pre-depth snapshot (older wire format) hydrates at the default
    // via the attach-time seeding, since depth is absent on the snap.
    const legacy = {
      freq: {
        value: 600,
        attached: { name: 'sine', params: {} },
      },
    } as unknown as DialsSnap
    const d = { freq: dial(600) }
    fromJSON(d, legacy)
    expect(d.freq.modDepth).toBe(DEFAULT_DEPTH)
  })

  it('detaches when the snapshot has no attached field', () => {
    const d = { freq: dial(600) }
    attach(d.freq, sine())
    fromJSON(d, { freq: { value: 600 } })
    expect(d.freq.attached).toBeNull()
  })

  it('throws on snapshot referencing an unregistered source', () => {
    clearRegistry() // wipe stdlib for this test
    const d = { freq: dial(0) }
    expect(() =>
      fromJSON(d, {
        freq: { value: 0, attached: { name: 'sine', params: {} } },
      } as unknown as DialsSnap),
    ).toThrow(/sine/)
  })

  it('leaves missing snapshot keys at their default', () => {
    const d = { a: dial(7), b: dial(8) }
    fromJSON(d, { a: { value: 1 } })
    expect(read(d, {})).toEqual({ a: 1, b: 8 })
  })

  it('ignores extra snapshot keys (forward-compat)', () => {
    const d = { a: dial(0) }
    fromJSON(d, { a: { value: 5 }, futureKey: { value: 99 } })
    expect(read(d, {})).toEqual({ a: 5 })
  })

  it('survives JSON.stringify / JSON.parse', () => {
    const d = { freq: dial(600) }
    const src = sine()
    src.params.freq.dial.value = 6.33
    attach(d.freq, src)
    setDepth(d.freq, 0.6)
    const wireFormat = JSON.parse(JSON.stringify(toJSON(d)))
    const fresh = { freq: dial(0) }
    fromJSON(fresh, wireFormat)
    expect(fresh.freq.attached!.params.freq.dial.value).toBe(6.33)
    expect(fresh.freq.modDepth).toBe(0.6)
  })

  it('round-trips glide — slot state like depth/mode', () => {
    const d = { freq: dial(600) }
    setGlide(d.freq, 2.5)
    const fresh = { freq: dial(0) }
    fromJSON(fresh, JSON.parse(JSON.stringify(toJSON(d))))
    expect(fresh.freq.glide).toBe(2.5)
  })

  it("leaves the slot's glide when the snapshot has none", () => {
    const d = { freq: dial(600) }
    setGlide(d.freq, 1)
    fromJSON(d, { freq: { value: 5 } })
    expect(d.freq.glide).toBe(1)
  })

  it('drops a snapshot attachment onto a non-modulatable slot', () => {
    // The code owns the meta: if it says the slot doesn't modulate, a
    // snapshot written under an older meta can't re-arm it. Value and
    // slot-level state still hydrate.
    const snap = {
      freq: {
        value: 42,
        depth: 0.5,
        glide: 1.5,
        attached: { name: 'sine', params: {} },
      },
    } as unknown as DialsSnap
    const d = { freq: dial(600, { modulatable: false }) }
    fromJSON(d, snap)
    expect(d.freq.attached).toBeNull()
    expect(d.freq.dial.value).toBe(42)
    expect(d.freq.modDepth).toBe(0.5)
    expect(d.freq.glide).toBe(1.5)
  })
})

describe('fromJSON() patches attached sources in place', () => {
  it('keeps code-declared param overrides on an attached source', () => {
    const mk = () => ({
      x: dial(0.5, {
        min: 0,
        max: 1,
        mod: sine({ freq: dial(50, { max: 100 }), phase: 0.25 }),
        depth: 1,
      }),
    })
    const b = mk()
    const kept = b.x.attached
    fromJSON(b, toJSON(mk()))
    expect(b.x.attached).toBe(kept)
    const freq = b.x.attached!.params['freq']!
    expect(freq.dial.value).toBe(50)
    expect(freq.dial.meta.max).toBe(100)
    expect(b.x.attached!.params['phase']!.dial.initial).toBe(0.25)
  })

  it('applies snapshot values to the kept instance', () => {
    const d = { x: dial(0, { mod: sine({ freq: dial(50, { max: 100 }) }) }) }
    fromJSON(d, {
      x: {
        value: 0,
        depth: 0.4,
        attached: { name: 'sine', params: { freq: { value: 70, depth: 0.2 } } },
      },
    } as unknown as DialsSnap)
    expect(d.x.modDepth).toBe(0.4)
    expect(d.x.attached!.params['freq']!.dial.value).toBe(70)
    expect(d.x.attached!.params['freq']!.modDepth).toBe(0.2)
  })

  it('keeps a shared instance shared', () => {
    const mk = () => {
      const l = sine()
      return { x: dial(0, { mod: l }), y: dial(0, { mod: l }) }
    }
    const a = mk()
    a.x.attached!.params['freq']!.dial.value = 3
    const b = mk()
    fromJSON(b, toJSON(a))
    expect(b.x.attached).toBe(b.y.attached)
    expect(b.x.attached!.params['freq']!.dial.value).toBe(3)
  })

  it('creates a fresh instance when the snapshot names a different source', () => {
    const d = { x: dial(0, { mod: sine() }) }
    fromJSON(d, {
      x: { value: 0, attached: { name: 'tri', params: {} } },
    } as unknown as DialsSnap)
    expect(d.x.attached!.def.name).toBe('tri')
  })

  it('round-trips a clamped plain-value override', () => {
    const mk = () => ({ x: dial(0, { mod: sine({ freq: 50 }) }) })
    const a = mk()
    const b = mk()
    fromJSON(b, toJSON(a))
    expect(toJSON(b)).toEqual(toJSON(a))
  })
})

describe('custom registered source', () => {
  it('round-trips when registered', () => {
    const custom = defineSource({
      name: 'test.custom',
      polarity: 'bipolar',
      params: { v: dial(0) },
      body: ({ v }) => v,
    })
    registerSource(custom)
    const d = { x: dial(0) }
    attach(d.x, custom())
    d.x.attached!.params.v.dial.value = 13
    const snap = toJSON(d)
    const fresh = { x: dial(0) }
    fromJSON(fresh, snap)
    expect(fresh.x.attached!.params.v.dial.value).toBe(13)
  })
})
