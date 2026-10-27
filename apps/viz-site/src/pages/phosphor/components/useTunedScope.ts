import { useEffect, useState } from 'react'
import { loadHeroPreset, type HeroPreset } from '../../../shared/scope'

const ENDPOINT = { endpoint: '/__preset/scope', fallbackUrl: '/scope-preset.json' }

/** A thinner, dimmer trace than the hero's, so on-glass UI stays readable over it. */
const DIM_SCREEN = { beamWidth: 1.2, intensity: 0.2, halationStrength: 0.8 }

interface Tunable {
  preset: HeroPreset
  /** Each fundamental's loaded freq, per wave, so the multiplier never compounds. */
  baseFreqs: number[][]
}

/**
 * Loads the hero scope preset once, dims its trace, and keeps its waves tuned to the
 * given frequency multiplier and noise-floor amplitude. Dial values
 * change in place, so the scope picks them up on its next frame.
 */
export function useTunedScope(freqMul: number, noise: number): HeroPreset | null {
  const [tunable, setTunable] = useState<Tunable | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadHeroPreset(ENDPOINT).then((preset) => {
      if (cancelled) return
      dim(preset)
      setTunable({ preset, baseFreqs: snapshotFreqs(preset) })
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (tunable) tune(tunable, freqMul, noise)
  }, [tunable, freqMul, noise])

  return tunable?.preset ?? null
}

function dim(preset: HeroPreset): void {
  const { screen } = preset
  screen.beamWidth.dial.value = DIM_SCREEN.beamWidth
  screen.intensity.dial.value = DIM_SCREEN.intensity
  screen.halationStrength.dial.value = DIM_SCREEN.halationStrength
}

function snapshotFreqs(preset: HeroPreset): number[][] {
  return preset.waves.map((w) => w.fundamentals.map((f) => f.freq.dial.value))
}

function tune({ preset, baseFreqs }: Tunable, freqMul: number, noise: number): void {
  preset.waves.forEach((wave, wi) => {
    wave.fundamentals.forEach((f, fi) => {
      f.freq.dial.value = (baseFreqs[wi]?.[fi] ?? f.freq.dial.value) * freqMul
    })
    wave.noiseFloor.amp.dial.value = noise
  })
}
