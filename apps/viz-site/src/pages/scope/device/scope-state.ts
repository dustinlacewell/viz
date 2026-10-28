import { PHOSPHOR_P31, type CrtPreset } from '@ldlework/crt'
import type { Wave } from '@ldlework/scope'
import { shapeFundamentals, type Shape } from './waveform'

/*
 * The bench scope's front panel as plain data, and its mapping onto a
 * scope Wave and a CRT preset. Pure — no state, no I/O.
 */

export interface ScopeControls {
  shape: Shape
  freqHz: number
  /** Peak level, in screen half-heights. */
  amp: number
  timePerDivSec: number
  /** Rising-edge trigger level, in screen half-heights. */
  triggerLevel: number
  /** Per-frame survival of the phosphor glow. */
  persistence: number
  intensity: number
}

export const DEFAULT_CONTROLS: ScopeControls = {
  shape: 'sine',
  freqHz: 440,
  amp: 0.6,
  timePerDivSec: 0.001,
  triggerLevel: 0,
  persistence: 0.86,
  intensity: 1,
}

// ─── Knob ranges ─────────────────────────────────────────────────────

/** Log scale. */
export const FREQ_RANGE: [number, number] = [20, 5000]
export const AMP_RANGE: [number, number] = [0, 1]
/** Log scale. */
export const TIME_PER_DIV_RANGE: [number, number] = [0.0001, 0.005]
export const TRIGGER_RANGE: [number, number] = [-1, 1]
export const PERSISTENCE_RANGE: [number, number] = [0.5, 0.99]
export const INTENSITY_RANGE: [number, number] = [0, 3]

// ─── Mapping ─────────────────────────────────────────────────────────

/** Horizontal divisions across the glass. */
export const DIVISIONS_X = 10
/** Vertical divisions down the glass. */
export const DIVISIONS_Y = 8
/** The signal must drop this far below the trigger level to re-arm. */
export const TRIGGER_HYSTERESIS = 0.05
/** A faint hiss under every shape, so the trace looks analog. */
export const NOISE_FLOOR_AMP = 0.01
const NOISE_SEED = 1

/*
 * Off, so each sweep starts where the signal crosses the trigger level
 * — the level knob then slides the trace. On, the pumper restarts every
 * fundamental at phase 0, and the level would only gate when to fire.
 */
const PHASE_LOCK = false

/** The scope wave the controls describe. */
export function toWave(c: ScopeControls): Wave {
  return {
    mute: false,
    beam: { intensity: c.intensity, width: 1 },
    sweep: {
      sweepSec: DIVISIONS_X * c.timePerDivSec,
      xJitter: 0,
      fireLevel: c.triggerLevel,
      armLevel: c.triggerLevel - TRIGGER_HYSTERESIS,
      phaseLock: PHASE_LOCK,
    },
    noiseFloor: { amp: c.shape === 'noise' ? c.amp : NOISE_FLOOR_AMP, seed: NOISE_SEED },
    fundamentals: shapeFundamentals(c.shape, c.freqHz, c.amp),
    bursts: [],
  }
}

/** The CRT screen the controls describe: a P31 tube at the set persistence. */
export function toScreen(c: ScopeControls): CrtPreset {
  return { ...PHOSPHOR_P31, persistence: c.persistence }
}
