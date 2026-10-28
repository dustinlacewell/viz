import { useState, type RefObject } from 'react'
import type { CrtSurfaceProps } from '@ldlework/crt/react'
import { DepositPass, makeSegmentPump, WavePumper, type BeamFn, type BeamSample, type Wave } from '@ldlework/scope'
import { toScreen, toWave, type ScopeControls } from './scope-state'

/** Beam samples per second of signal time. */
const BEAM_HZ = 500_000
/** Most samples drawn in one frame; also sizes the segment buffers. */
const MAX_SAMPLES_PER_FRAME = 16_384
/** Beam Gaussian width, in CSS px. */
const BEAM_WIDTH_PX = 1.4

type ScopeTrace = Required<Pick<CrtSurfaceProps, 'passes' | 'stage' | 'presetFn'>>

/**
 * The CRT wiring for the bench scope: one deposit pass fed by one
 * wave pumper. `controls` is read every frame, so turning a knob never
 * rebuilds the surface.
 */
export function useScopeTrace(controls: RefObject<ScopeControls>): ScopeTrace {
  const [trace] = useState<ScopeTrace>(() => {
    let deposit: DepositPass | null = null
    const pump = makeSegmentPump(MAX_SAMPLES_PER_FRAME)
    const beam = makeBeamFn(() => controls.current)
    return {
      passes: (gl) => {
        deposit = new DepositPass(gl, MAX_SAMPLES_PER_FRAME)
        return [deposit]
      },
      stage: (t, dt) => {
        if (!deposit) return
        deposit.setBatch(pump.pump(beam, t, dt))
        deposit.setBeamWidth(BEAM_WIDTH_PX)
      },
      presetFn: () => toScreen(controls.current),
    }
  })
  return trace
}

/**
 * Steps the pumper for one frame's worth of signal time. The beam is
 * blanked between sweeps; a break sample starts each new sweep so no
 * segment joins the end of one sweep to the start of the next.
 *
 * The pumper keeps one phase per sine term. A square or saw holds its
 * shape only while every harmonic starts in step, so a new pumper
 * starts whenever the set of harmonics changes.
 */
function makeBeamFn(read: () => ScopeControls): BeamFn {
  let pumper = new WavePumper(BEAM_HZ)
  let harmonics = ''
  const out: BeamSample[] = []
  let wasOn = false
  return (t, dt) => {
    const controls = read()
    const wave = toWave(controls)
    const key = harmonicsKey(controls, wave)
    if (key !== harmonics) {
      pumper = new WavePumper(BEAM_HZ)
      harmonics = key
    }
    const ctx = { t, dt }
    const budget = Math.max(1, Math.min(MAX_SAMPLES_PER_FRAME, Math.floor(dt * BEAM_HZ)))
    out.length = 0
    for (let i = 0; i < budget; i++) {
      const p = pumper.step(wave, ctx)
      const on = p.on !== false
      if (on) out.push(sample(p.x, p.y, p.beamI, !wasOn))
      wasOn = on
    }
    return out
  }
}

/** Which harmonics the wave holds: its shape and how many terms survive the cutoff. */
function harmonicsKey(controls: ScopeControls, wave: Wave): string {
  return `${controls.shape}:${wave.fundamentals.length}`
}

function sample(x: number, y: number, beamI: number | undefined, isBreak: boolean): BeamSample {
  const s: BeamSample = { x, y }
  if (isBreak) s.break = true
  if (beamI !== undefined) s.beamI = beamI
  return s
}
