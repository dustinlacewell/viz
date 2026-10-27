// ─── Spectrum (pure) ─────────────────────────────────────────────────

export const BAR_COUNT = 16

/** One beat at 120 BPM. */
const BEAT_S = 0.5
const KICK_DECAY_S = 0.12
const SNARE_DECAY_S = 0.1
const HAT_DECAY_S = 0.04

/**
 * Band levels in [0, 1] at time `t`. Each band follows its own random
 * noise, so the bars never fall into step. A kick on every beat lifts
 * the bass, a snare on beats 2 and 4 lifts the mids, and a hat on every
 * half beat lifts the treble. A slow swell rides over the lot. Bass and
 * treble (dB) tilt the low and high bands; volume scales the lot.
 * `t` null means paused — every band rests at zero.
 */
export function spectrum(t: number | null, volume: number, bassDb: number, trebleDb: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    if (t === null) return 0
    const x = i / (BAR_COUNT - 1)
    const contour = 1 - 0.5 * x
    const eqDb = bassDb * (1 - x) ** 2 + trebleDb * x ** 2
    const level = volume * contour * swell(t) * bandEnergy(i, x, t) * 10 ** (eqDb / 20)
    return Math.min(1, level)
  })
}

/** How hard band `i` (at position `x` in 0..1, low to high) is hit at `t`. */
function bandEnergy(i: number, x: number, t: number): number {
  // Low bands move slowly, high bands flicker.
  const texture = noise(i, t * (3 + 9 * x))
  const beat = t % BEAT_S
  const bar = t % (BEAT_S * 4)
  const kick = Math.exp(-beat / KICK_DECAY_S)
  const snare = (bar >= BEAT_S && bar < BEAT_S * 2) || bar >= BEAT_S * 3
    ? Math.exp(-beat / SNARE_DECAY_S)
    : 0
  const hat = Math.exp(-(t % (BEAT_S / 2)) / HAT_DECAY_S)
  const hits =
    (1 - x) ** 3 * kick +
    4 * x * (1 - x) * snare * 0.8 +
    x ** 3 * hat * 0.7
  return 0.2 + 0.55 * texture + 0.6 * hits
}

/** The song's loudness, drifting over several seconds. */
function swell(t: number): number {
  return 0.75 + 0.35 * noise(BAR_COUNT, t * 0.15)
}

/**
 * Smooth random value in [0, 1] for `channel` at position `x`: two
 * octaves of value noise. Unlike a sum of sines it never repeats, so
 * the channels never fall into step.
 */
function noise(channel: number, x: number): number {
  return (2 * valueNoise(channel, x) + valueNoise(channel + 101, x * 2.3)) / 3
}

function valueNoise(channel: number, x: number): number {
  const i = Math.floor(x)
  const f = x - i
  const ease = f * f * (3 - 2 * f)
  const a = hash(channel * 7919 + i)
  const b = hash(channel * 7919 + i + 1)
  return a + (b - a) * ease
}

/** A pseudo-random number in [0, 1) for each integer `n`. */
function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}
