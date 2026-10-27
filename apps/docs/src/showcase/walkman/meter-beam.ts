import { mulberry32, type BeamSample } from '@ldlework/scope'
import type { CrtRegionRect } from '@ldlework/phosphor-crt'
import { BAR_COUNT } from './spectrum'

// ─── Meter beam paths (pure) ─────────────────────────────────────────

export type MeterMode = 'bars' | 'wave'

/** The beam path that draws the meter for one frame, inside `rect`. */
export function meterBeam(
  mode: MeterMode,
  levels: readonly number[],
  t: number,
  rect: CrtRegionRect,
): BeamSample[] {
  return mode === 'bars' ? barsBeam(levels, rect) : waveBeam(levels, t, rect)
}

const BLOCKS = 8
/** Space between bars, as a fraction of one bar's slot. */
const BAR_GAP = 0.2
/** Strength of an unlit block: the faint ghost of an LED. */
const GHOST = 0.12
/** Beam width multiplier that makes a beam line read as a block. */
const BLOCK_WIDTH = 2.2

/**
 * One column of LED blocks per band, lit from the bottom up to the
 * band's level. Each block is a short thick beam line, sampled about
 * once per CSS pixel: the beam deposits per segment, so dense samples
 * make an even block.
 */
function barsBeam(levels: readonly number[], rect: CrtRegionRect): BeamSample[] {
  const out: BeamSample[] = []
  const slot = (rect.right - rect.left) / levels.length
  const row = (rect.top - rect.bottom) / BLOCKS
  const steps = Math.max(2, Math.ceil((rect.width / levels.length) * (1 - BAR_GAP)))
  levels.forEach((level, i) => {
    const lit = Math.ceil(level * BLOCKS)
    const x0 = rect.left + slot * (i + BAR_GAP / 2)
    const x1 = x0 + slot * (1 - BAR_GAP)
    for (let b = 0; b < BLOCKS; b++) {
      const y = rect.bottom + row * (b + 0.5)
      const beamI = b < lit ? 1 : GHOST
      out.push({ x: x0, y, break: true })
      for (let s = 0; s <= steps; s++) {
        out.push({ x: x0 + ((x1 - x0) * s) / steps, y, beamI, beamWidth: BLOCK_WIDTH })
      }
    }
  })
  return out
}

const WAVE_SAMPLES = 1200
/** Seconds of audio shown across the meter. */
const WAVE_WINDOW = 0.03
/** Gain before the soft clip; higher drives the trace into the rails. */
const WAVE_GAIN = 0.45
/** Lowest and highest band centre, in Hz; bands are spaced evenly in pitch. */
const LOW_HZ = 40
const HIGH_HZ = 6000

interface Tone {
  hz: number
  phase: number
}

/**
 * Three detuned partials per band, with fixed random phases. Detuned
 * partials beat against each other, so each band wanders like real
 * program material instead of holding one clean sine.
 */
const PARTIALS: readonly (readonly Tone[])[] = (() => {
  const rng = mulberry32(0x5eed)
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const hz = LOW_HZ * (HIGH_HZ / LOW_HZ) ** (i / (BAR_COUNT - 1))
    return [0.97, 1, 1.04].map((detune) => ({ hz: hz * detune, phase: rng.next() * 2 * Math.PI }))
  })
})()

/**
 * A free-running scope on an audio signal. The trace shows a short
 * window of sound that starts at `t`, so it jumps from frame to frame
 * and the phosphor smears the frames together. The band levels carry
 * the beat, so the trace swells with the bars. At rest every level is
 * zero, so the trace lies flat.
 */
function waveBeam(levels: readonly number[], t: number, rect: CrtRegionRect): BeamSample[] {
  const mid = (rect.top + rect.bottom) / 2
  const half = (rect.top - rect.bottom) / 2
  const out: BeamSample[] = [{ x: rect.left, y: mid, break: true }]
  for (let s = 0; s <= WAVE_SAMPLES; s++) {
    const u = s / WAVE_SAMPLES
    const sample = audioSample(levels, t + u * WAVE_WINDOW)
    out.push({ x: rect.left + (rect.right - rect.left) * u, y: mid + half * Math.tanh(sample * WAVE_GAIN) })
  }
  return out
}

/** The signal at audio time `tau` seconds. */
function audioSample(levels: readonly number[], tau: number): number {
  let sum = 0
  levels.forEach((level, i) => {
    let band = 0
    for (const p of PARTIALS[i]!) band += Math.sin(2 * Math.PI * p.hz * tau + p.phase)
    sum += (level * band) / 3
  })
  return sum
}
