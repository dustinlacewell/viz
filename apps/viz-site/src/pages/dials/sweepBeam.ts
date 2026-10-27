/*
 * sweepBeam — pure BeamFn factory for a time-sweep scope trace.
 *
 * x walks left to right over `sweepSec` seconds of signal time, then
 * snaps back (the retrace is blanked). y is `signal(t)` at that time.
 * Signal time advances only by the frame time handed to the BeamFn,
 * sampled at `beamHz` — so `signal` is always called with increasing t,
 * which dt-driven dials sources need.
 */

import type { BeamFn, BeamSample } from '@ldlework/scope'

export interface SweepBeamOptions {
  /** Seconds of signal across the full screen width. */
  sweepSec: number
  /** Signal samples per second. */
  beamHz: number
  /** Screen y (NDC) for a signal value of 1. */
  yScale: number
  /** Longest frame step honoured, in seconds (tab refocus guard). */
  maxFrameSec: number
}

export function makeSweepBeam(
  signal: (t: number) => number,
  { sweepSec, beamHz, yScale, maxFrameSec }: SweepBeamOptions,
): BeamFn {
  let signalT = 0
  let prevPhase = 0

  return (_t, dt) => {
    const frameSec = Math.min(dt, maxFrameSec)
    const n = Math.max(1, Math.ceil(frameSec * beamHz))
    const step = frameSec / n
    const out: BeamSample[] = []

    for (let i = 0; i < n; i++) {
      signalT += step
      const phase = (signalT / sweepSec) % 1
      const sample: BeamSample = { x: phase * 2 - 1, y: signal(signalT) * yScale }
      if (phase < prevPhase) sample.break = true
      prevPhase = phase
      out.push(sample)
    }
    return out
  }
}
