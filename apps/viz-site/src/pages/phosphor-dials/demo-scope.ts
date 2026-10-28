import { dial, sine, tri } from '@ldlework/dials'
import { makeDefaultPreset, type HeroPreset } from '../../shared/scope'

/*
 * The demo's dial tree, and the CRT scope preset it drives. The
 * preset's wave holds these same slots, so the scope reads them every
 * frame; that read also keeps each knob riding its modulated value.
 *
 * Every dial starts with a slow source attached, at a different rate,
 * so the trace moves on load and each knob shows modulation.
 */
export const demoDials = {
  freq: dial(220, {
    min: 50,
    max: 2000,
    scale: 'log',
    unit: 'Hz',
    description: 'Oscillator pitch.',
    mod: sine({ freq: 0.15 }),
    depth: 0.4,
  }),
  amp: dial(0.5, {
    min: 0,
    max: 1,
    description: 'Trace height, 0 to full.',
    mod: tri({ freq: 0.23 }),
    depth: 0.4,
  }),
  sweep: dial(0.01, {
    min: 0.002,
    max: 0.04,
    scale: 'log',
    unit: 's',
    description: 'Time across the screen.',
    mod: sine({ freq: 0.07 }),
    depth: 0.3,
  }),
}

/** A default scope preset whose one wave is a single sine set by `demoDials`. */
export function makeDemoPreset(): HeroPreset {
  const preset = makeDefaultPreset()
  const wave = preset.waves[0]!
  wave.fundamentals = [{ freq: demoDials.freq, amp: demoDials.amp, phase: dial(0) }]
  wave.sweep.sweepSec = demoDials.sweep
  return preset
}
