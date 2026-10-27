/**
 * The standard library of sources. Auto-registered when the package
 * is imported.
 *
 * Every stdlib source is a *normalized signal generator*: bipolar
 * sources emit in [-1, 1], unipolar sources in [0, 1) — declared via
 * `polarity` on the def. Sources know nothing about the host slot's
 * units or range; the sampler scales their signal by the attachment's
 * `depth` and adds it onto the slot's base value in knob-travel
 * space. Combinators (`add`, `mul`, `lerp`, gates) operate in that
 * same signal space.
 *
 * Convention: sources that advance over time integrate `ctx.dt` (a
 * number, seconds per frame) into a per-instance accumulator rather
 * than rescaling absolute `ctx.t`. This keeps the instantaneous
 * phase/position continuous when the user edits `freq`/`rate`/`period`
 * live: a rate change bends the *slope* of the accumulator from here
 * on, it doesn't rescale all elapsed time and snap the knob. The
 * contract is dt-driven advance — a host that jumps `ctx.t` no longer
 * scrubs these sources (intended). Phase-domain sources still read
 * `ctx.phase`.
 *
 * Stateful sources (the oscillators, `smooth`, the noises, `gate`)
 * hold their state — accumulators, filter memory, RNG cursors
 * — in a closure created by `setup` once per instance. Two instances
 * on different slots never share memory.
 *
 * Param `description`s are the param docstrings, surfaced by the panel
 * on hover of the param's title; `unit` is the readout suffix ('Hz',
 * 's'). A param's `label` is set only where it differs from its key.
 */

import type { AnySourceDef, Ctx } from './core'
import { dial } from './dial'
import { defineSource, registerSource } from './source'

// ─── helpers ───────────────────────────────────────────────────────────

/** Read `ctx.dt` as a number, defaulting to 1/60. */
function getDt(ctx: Ctx): number {
  const dt = ctx['dt']
  return typeof dt === 'number' ? dt : 1 / 60
}

/** Mulberry32 — small fast seeded RNG, deterministic from a 32-bit seed. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── shape sources ─────────────────────────────────────────────────────

/**
 * `sine` — `sin(2π · (ph + phase))`, bipolar [-1, 1]. `ph` is a
 * per-instance phase accumulator advanced by `freq · dt` cycles each
 * sample; `phase` is a user-set cycle offset (radians, added inside
 * the sine). Accumulating means a live `freq` edit bends the pitch
 * from here on without snapping the current position.
 */
export const sine = defineSource({
  name: 'sine',
  description: 'Smooth periodic wave.',
  polarity: 'bipolar',
  params: {
    freq:  dial(1, { min: 0.01, max: 20, scale: 'log', unit: 'Hz', description: 'Cycles per second.' }),
    phase: dial(0, { min: 0, max: 6.2832, description: 'Start offset, in radians.' }),
  },
  setup: () => {
    let ph = 0 // phase accumulator, cycles
    return ({ freq, phase }, ctx) => {
      ph = (ph + freq * getDt(ctx)) % 1
      return Math.sin(2 * Math.PI * ph + phase)
    }
  },
})

/**
 * `tri` — triangle wave, bipolar [-1, 1]. Phase accumulates by
 * `freq · dt`; `phase` is a cycle offset in [0, 1].
 */
export const tri = defineSource({
  name: 'tri',
  description: 'Linear rise and fall.',
  polarity: 'bipolar',
  params: {
    freq:  dial(1, { min: 0.01, max: 20, scale: 'log', unit: 'Hz', description: 'Cycles per second.' }),
    phase: dial(0, { min: 0, max: 1, description: 'Start offset, one full cycle = 1.' }),
  },
  setup: () => {
    let ph = 0 // phase accumulator, cycles
    return ({ freq, phase }, ctx) => {
      ph = (ph + freq * getDt(ctx)) % 1
      const p = (ph + phase) % 1
      return p < 0.5 ? 4 * p - 1 : 3 - 4 * p // [-1, 1]
    }
  },
})

/**
 * `saw` — rising sawtooth, bipolar [-1, 1]. Phase accumulates by
 * `freq · dt`; `phase` is a cycle offset in [0, 1].
 */
export const saw = defineSource({
  name: 'saw',
  description: 'Ramps up, snaps back.',
  polarity: 'bipolar',
  params: {
    freq:  dial(1, { min: 0.01, max: 20, scale: 'log', unit: 'Hz', description: 'Cycles per second.' }),
    phase: dial(0, { min: 0, max: 1, description: 'Start offset, one full cycle = 1.' }),
  },
  setup: () => {
    let ph = 0 // phase accumulator, cycles
    return ({ freq, phase }, ctx) => {
      ph = (ph + freq * getDt(ctx)) % 1
      const p = (ph + phase) % 1
      return 2 * p - 1 // [-1, 1)
    }
  },
})

/**
 * `square` — duty-cycle-able pulse, bipolar {-1, +1}. Phase
 * accumulates by `freq · dt`; `phase` is a cycle offset in [0, 1].
 */
export const square = defineSource({
  name: 'square',
  description: 'Flips between extremes. Duty sets the split.',
  polarity: 'bipolar',
  params: {
    freq:  dial(1, { min: 0.01, max: 20, scale: 'log', unit: 'Hz', description: 'Cycles per second.' }),
    duty:  dial(0.5, { min: 0, max: 1, description: 'Fraction of each cycle spent high.' }),
    phase: dial(0, { min: 0, max: 1, description: 'Start offset, one full cycle = 1.' }),
  },
  setup: () => {
    let ph = 0 // phase accumulator, cycles
    return ({ freq, duty, phase }, ctx) => {
      ph = (ph + freq * getDt(ctx)) % 1
      const p = (ph + phase) % 1
      return p < duty ? 1 : -1
    }
  },
})

// ─── noise ─────────────────────────────────────────────────────────────

/**
 * `whiteNoise` — uniform random, bipolar [-1, 1). Seeded; each
 * instance gets its own RNG stream from `setup`.
 */
export const whiteNoise = defineSource({
  name: 'whiteNoise',
  description: 'A new random value every sample.',
  polarity: 'bipolar',
  params: {
    seed: dial(1, { min: 1, max: 9999, description: 'Picks the random stream — same seed, same noise.' }),
  },
  setup: () => {
    let rng: (() => number) | null = null
    let lastSeed = NaN
    return ({ seed }) => {
      if (seed !== lastSeed) {
        rng = mulberry32(Math.floor(seed))
        lastSeed = seed
      }
      // rng returns [0, 1) — remap to [-1, 1).
      return rng!() * 2 - 1
    }
  },
})

/**
 * `valueNoise` — smooth random walk, cosine-eased between
 * deterministic control points at `rate` points-per-second. Bipolar
 * [-1, 1]. The sample position is a per-instance accumulator advanced
 * by `rate · dt` each frame, so a live `rate` edit changes the drift
 * speed from here on without teleporting the position.
 */
export const valueNoise = defineSource({
  name: 'valueNoise',
  description: 'Random values, smoothly eased between.',
  polarity: 'bipolar',
  params: {
    seed: dial(1, { min: 1, max: 9999, description: 'Picks the random stream — same seed, same noise.' }),
    rate: dial(1, { min: 0.01, max: 20, scale: 'log', unit: 'pts/s', description: 'New random points per second.' }),
  },
  setup: () => {
    const hash = (seed: number, n: number) => {
      const v = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453
      return v - Math.floor(v)
    }
    const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t)
    let x = 0 // position accumulator, points
    return ({ seed, rate }, ctx) => {
      x += rate * getDt(ctx)
      const i = Math.floor(x)
      const f = x - i
      const a = hash(seed, i)
      const b = hash(seed, i + 1)
      const u = a + (b - a) * ease(f) // [0, 1]
      return u * 2 - 1                // [-1, 1]
    }
  },
})

// ─── perlin family ────────────────────────────────────────────────────
//
// Classic 1D Perlin noise: gradient noise interpolated with the
// fade(t) = 6t⁵ − 15t⁴ + 10t³ quintic curve so the output is C²
// continuous. Character: smoother and more "natural" than valueNoise,
// and the gradient interpolation produces a balanced [-1, 1] output
// without the slight bias valueNoise has near integer boundaries.

/** fade(t) = 6t^5 - 15t^4 + 10t^3 — Perlin's improved fade. */
function perlinFade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/**
 * Per-grid-point gradient in 1D — really just a signed scalar in
 * [-1, 1]. Deterministic from (seed, integer index).
 */
function gradient1D(seed: number, i: number): number {
  // Same sin-based hash as valueNoise, remapped to signed.
  const v = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return (v - Math.floor(v)) * 2 - 1
}

/**
 * `perlin1D` — classic 1D Perlin gradient noise, eased with the
 * quintic fade, bipolar [-1, 1]. Raw 1D perlin with [-1, 1] gradients
 * only reaches ±0.5, so the output is stretched 2× and clamped so the
 * full signal range is reachable in practice. Smoother than
 * valueNoise; the C² continuity makes it the right choice for driving
 * anything where you don't want visible "corners" in the motion. The
 * sample position accumulates `rate · dt` per frame, so a live `rate`
 * edit changes drift speed without teleporting the position.
 */
export const perlin1D = defineSource({
  name: 'perlin1D',
  description: 'Smooth gradient noise.',
  polarity: 'bipolar',
  params: {
    seed: dial(1, { min: 1, max: 9999, description: 'Picks the random stream — same seed, same noise.' }),
    rate: dial(1, { min: 0.01, max: 20, scale: 'log', unit: 'u/s', description: 'How fast the noise drifts.' }),
  },
  setup: () => {
    let x = 0 // position accumulator, units
    return ({ seed, rate }, ctx) => {
      x += rate * getDt(ctx)
      const i = Math.floor(x)
      const f = x - i
      const g0 = gradient1D(seed, i)
      const g1 = gradient1D(seed, i + 1)
      // dot(gradient, distance) at each endpoint. With gradients in
      // [-1, 1] and f in [0, 1], each d is in [-1, 1].
      const d0 = g0 * f
      const d1 = g1 * (f - 1)
      const u = perlinFade(f)
      const n = d0 + u * (d1 - d0)
      // Normalize: 1D perlin with [-1, 1] gradients reaches its
      // theoretical extrema of ±0.5 at midpoints when adjacent
      // gradients are maximally opposed. Stretch 2× and clamp so the
      // extremes of the [-1, 1] contract are reachable in practice.
      return Math.max(-1, Math.min(1, n * 2))
    }
  },
})

/**
 * `fbm` — fractional Brownian motion, bipolar [-1, 1]. Stack
 * `octaves` octaves of perlin1D, each at double the frequency and
 * half the amplitude. Produces noise with self-similar detail across
 * scales — the cloud-like / terrain-like character you reach for when
 * smooth Perlin feels too plain. The base sample position accumulates
 * `rate · dt` per frame, so a live `rate` edit changes drift speed
 * without teleporting the position.
 *
 *   octaves    1..6 typical. More = more detail, more CPU.
 *   lacunarity frequency multiplier per octave (default 2)
 *   gain       amplitude multiplier per octave (default 0.5)
 */
export const fbm = defineSource({
  name: 'fbm',
  description: 'Layered noise — broad drift with fine detail.',
  polarity: 'bipolar',
  params: {
    seed:       dial(1, { min: 1, max: 9999, description: 'Picks the random stream — same seed, same noise.' }),
    rate:       dial(1, { min: 0.01, max: 20, scale: 'log', unit: 'u/s', description: 'How fast the noise drifts.' }),
    octaves:    dial(4, { min: 1, max: 6, description: 'How many layers of detail to stack.' }),
    lacunarity: dial(2, { min: 1.01, max: 4, description: 'Frequency step between layers.' }),
    gain:       dial(0.5, { min: 0.05, max: 0.95, description: 'How much each finer layer contributes.' }),
  },
  setup: () => {
    let pos = 0 // base position accumulator, units
    return ({ seed, rate, octaves, lacunarity, gain }, ctx) => {
      pos += rate * getDt(ctx)
      const t = pos
      const N = Math.max(1, Math.floor(octaves))
      let freq = 1
      let amp = 1
      let sum = 0
      let norm = 0
      for (let o = 0; o < N; o++) {
        const x = t * freq
        const i = Math.floor(x)
        const f = x - i
        // Decorrelate octaves by offsetting the seed per-octave so
        // they don't all wobble at the same instants.
        const s = seed + o * 131
        const g0 = gradient1D(s, i)
        const g1 = gradient1D(s, i + 1)
        const d0 = g0 * f
        const d1 = g1 * (f - 1)
        const u = perlinFade(f)
        sum += amp * (d0 + u * (d1 - d0))
        norm += amp
        freq *= lacunarity
        amp *= gain
      }
      // sum/norm is a weighted average of N octaves. As N grows the
      // distribution clusters around 0 (CLT-ish), so we stretch the
      // dynamic range to keep the output spanning [-1, 1] in
      // practice. The 1.4 factor was tuned empirically to make
      // 4-octave fbm reach near the bounds.
      const n = (sum / Math.max(norm, 1e-6)) * 1.4
      return Math.max(-1, Math.min(1, n * 2))
    }
  },
})

/**
 * `brown` — brownian (red) noise, bipolar [-1, 1]. Random walk: each
 * frame's value is the previous value plus a small seeded step. Slow,
 * drifting character — feels like organic instability rather than the
 * intentional shape of perlin or sine. The walk reflects off the
 * [-1, 1] boundaries so it doesn't pin to either edge.
 *
 * Stateful: the walk state lives per-instance.
 */
export const brown = defineSource({
  name: 'brown',
  description: "Random walk — wanders, doesn't jump.",
  polarity: 'bipolar',
  params: {
    seed: dial(1, { min: 1, max: 9999, description: 'Picks the random stream — same seed, same walk.' }),
    rate: dial(1, { min: 0.01, max: 50, scale: 'log', label: 'step rate', description: 'How fast the walk wanders.' }),
  },
  setup: () => {
    let rng: (() => number) | null = null
    let lastSeed = NaN
    let y = 0 // walk position in [-1, 1]
    return ({ seed, rate }, ctx) => {
      if (seed !== lastSeed) {
        rng = mulberry32(Math.floor(seed))
        lastSeed = seed
        y = 0
      }
      // Step size proportional to dt * rate, so changing dt doesn't
      // change the apparent speed. Step is in signal space; we reflect
      // off [-1, 1] so the walk stays bounded.
      const step = (rng!() * 2 - 1) * Math.min(1, getDt(ctx) * rate)
      y += step * 0.2
      if (y < -1) y = -2 - y
      if (y > 1) y = 2 - y
      if (y < -1) y = -1
      if (y > 1) y = 1
      return y
    }
  },
})

// ─── filters ───────────────────────────────────────────────────────────

/**
 * `smooth` — one-pole lowpass on `signal` with time constant `tau`
 * (seconds). Reads `ctx.dt`. Stateful; first sample initializes to
 * `signal`. Useful for de-jittering modulators. Each instance has its
 * own filter memory.
 */
export const smooth = defineSource({
  name: 'smooth',
  description: 'Lowpasses its input signal.',
  polarity: 'bipolar',
  params: {
    signal: dial(0, { min: -1, max: 1, description: 'The input to smooth — modulate it with a source.' }),
    tau:    dial(0.1, { min: 0.001, max: 5, scale: 'log', unit: 's', description: 'Smoothing time — bigger lags more.' }),
  },
  setup: () => {
    let y = NaN
    return ({ signal, tau }, ctx) => {
      if (!Number.isFinite(y)) y = signal
      const dt = getDt(ctx)
      const alpha = 1 - Math.exp(-dt / Math.max(tau, 1e-6))
      y = y + (signal - y) * alpha
      return y
    }
  },
})

// ─── combinators ───────────────────────────────────────────────────────

/**
 * `add` — `a + b` in signal space. Both modulatable. The sum can
 * mathematically exceed ±1; the slot-level clamp bounds the combined
 * output, so overshoot just saturates the modulation.
 */
export const add = defineSource({
  name: 'add',
  description: 'Sum of two signals.',
  polarity: 'bipolar',
  params: {
    a: dial(0, { min: -1, max: 1, description: 'First input — modulate it with a source.' }),
    b: dial(0, { min: -1, max: 1, description: 'Second input — modulate it with a source.' }),
  },
  body: ({ a, b }) => a + b,
})

/**
 * `mul` — `a * b` in signal space. Both modulatable. The product can
 * mathematically exceed ±1 when inputs do; the slot-level clamp
 * bounds the combined output.
 */
export const mul = defineSource({
  name: 'mul',
  description: 'Product of two signals.',
  polarity: 'bipolar',
  params: {
    a: dial(1, { min: -1, max: 1, description: 'First input — modulate it with a source.' }),
    b: dial(1, { min: -1, max: 1, description: 'Second input — modulate it with a source.' }),
  },
  body: ({ a, b }) => a * b,
})

/**
 * `lerp` — linear interpolate between `a` and `b` by `t ∈ [0, 1]`.
 * No clamp on `t` — values outside [0,1] extrapolate, by design, so
 * the output can exceed ±1; the slot-level clamp bounds it.
 */
export const lerp = defineSource({
  name: 'lerp',
  description: 'Blend of two signals by t.',
  polarity: 'bipolar',
  params: {
    a: dial(0, { min: -1, max: 1, description: 'Value at t=0 — modulate it with a source.' }),
    b: dial(1, { min: -1, max: 1, description: 'Value at t=1 — modulate it with a source.' }),
    t: dial(0.5, { min: 0, max: 1, description: 'Blend position — 0 is all a, 1 is all b.' }),
  },
  body: ({ a, b, t }) => a + (b - a) * t,
})

// ─── gating ────────────────────────────────────────────────────────────

/**
 * `gate` — passes `signal` through when the cycle phase lies in
 * `[lo, hi]`; otherwise returns `closed`. `lo`/`hi` here are
 * *phase-window fractions* in [0, 1] — timing config, nothing to do
 * with output range. The phase is a per-instance accumulator advancing
 * `dt / period` cycles per frame (wrapped into [0, 1)), so a live
 * `period` edit changes the cadence from here on without snapping the
 * phase. For phase-locked gating against a non-time domain, use
 * `phaseGate`.
 *
 * Common use: gate a sub-modulator to only fire during a portion of a
 * cyclic event.
 */
export const gate = defineSource({
  name: 'gate',
  description: 'Chops between signal and a floor on a timer.',
  polarity: 'bipolar',
  params: {
    signal: dial(0, { min: -1, max: 1, description: 'Passed through while open — modulate it with a source.' }),
    closed: dial(0, { min: -1, max: 1, label: 'closed value', description: 'Held while the gate is shut.' }),
    period: dial(1, { min: 0.001, max: 60, unit: 's', description: 'Seconds per open/close cycle.' }),
    lo:     dial(0, { min: 0, max: 1, label: 'open at (frac)', description: 'Cycle fraction the gate opens at.' }),
    hi:     dial(0.5, { min: 0, max: 1, label: 'close at (frac)', description: 'Cycle fraction the gate closes at.' }),
  },
  setup: () => {
    let ph = 0 // cycle phase accumulator, [0, 1)
    return ({ signal, closed, period, lo, hi }, ctx) => {
      ph = (ph + getDt(ctx) / Math.max(period, 1e-9)) % 1
      return ph >= lo && ph < hi ? signal : closed
    }
  },
})

/**
 * `phaseGate` — like `gate` but reads `ctx.phase` (a number in
 * `[0, 1]`) directly instead of deriving phase from `t`. `lo`/`hi`
 * are phase-window fractions in [0, 1]. For oscilloscope sweep
 * windows, beat-relative timing, etc.: have the app populate
 * `ctx.phase` from whatever clock matters.
 */
export const phaseGate = defineSource({
  name: 'phaseGate',
  description: 'Passes the signal only inside a phase window.',
  polarity: 'bipolar',
  params: {
    signal: dial(0, { min: -1, max: 1, description: 'Passed through inside the window — modulate it with a source.' }),
    closed: dial(0, { min: -1, max: 1, label: 'closed value', description: 'Held outside the window.' }),
    lo:     dial(0, { min: 0, max: 1, label: 'open at', description: 'Phase the window opens at.' }),
    hi:     dial(0.5, { min: 0, max: 1, label: 'close at', description: 'Phase the window closes at.' }),
  },
  body: ({ signal, closed, lo, hi }, ctx) => {
    const p = ctx['phase']
    const phase = typeof p === 'number' ? p : 0
    return phase >= lo && phase < hi ? signal : closed
  },
})

// ─── registration ──────────────────────────────────────────────────────

/**
 * Every stdlib source, in one list. Imported by `index.ts` which
 * auto-registers them.
 */
export const STDLIB: AnySourceDef[] = [
  sine,
  tri,
  saw,
  square,
  whiteNoise,
  valueNoise,
  perlin1D,
  fbm,
  brown,
  smooth,
  add,
  mul,
  lerp,
  gate,
  phaseGate,
]

/**
 * Register every stdlib source. Called at package-import time by
 * `index.ts`; idempotent — re-running just re-registers.
 */
export function registerStdlib(): void {
  for (const def of STDLIB) registerSource(def)
}
