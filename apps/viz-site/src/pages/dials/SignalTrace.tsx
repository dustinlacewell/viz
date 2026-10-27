/*
 * SignalTrace — draws `sample(t)` as a phosphor beam on a CRT, like an
 * oscilloscope in time-sweep mode: x sweeps through time, y is the value.
 */

import { useCallback, useMemo, useRef } from 'react'
import { CrtSurface } from '@ldlework/crt/react'
import type { CrtPreset, DrawablePass, DrawCtx } from '@ldlework/crt'
import { DepositPass, makeSegmentPump, type SegmentPump } from '@ldlework/scope'
import { Display } from '@ldlework/phosphor'
import { makeSweepBeam } from './sweepBeam'

const SWEEP_SEC = 3
const BEAM_HZ = 3000
const MAX_FRAME_SEC = 0.1
const SEGMENT_CAPACITY = Math.ceil(MAX_FRAME_SEC * BEAM_HZ) + 1

/** Long enough that the trace fades over about one sweep. */
const PRESET: CrtPreset = { persistence: 0.975, persistenceBeta: 1, intensity: 0.25 }

export function SignalTrace({ sample }: { sample: (t: number) => number }) {
  const depositRef = useRef<DepositPass | null>(null)
  const pumpRef = useRef<SegmentPump | null>(null)

  const beamFn = useMemo(
    () => makeSweepBeam(sample, {
      sweepSec: SWEEP_SEC,
      beamHz: BEAM_HZ,
      yScale: 0.9,
      maxFrameSec: MAX_FRAME_SEC,
    }),
    [sample],
  )

  const passes = useCallback((gl: WebGL2RenderingContext): DrawablePass<DrawCtx>[] => {
    const deposit = new DepositPass(gl, SEGMENT_CAPACITY)
    depositRef.current = deposit
    pumpRef.current = makeSegmentPump(SEGMENT_CAPACITY)
    return [deposit]
  }, [])

  const stage = useCallback(
    (t: number, dt: number) => {
      const pump = pumpRef.current
      if (pump) depositRef.current?.setBatch(pump.pump(beamFn, t, dt))
    },
    [beamFn],
  )

  return (
    <Display padding={0} style={{ width: '100%' }}>
      <div className="signal-trace">
        <CrtSurface {...PRESET} passes={passes} stage={stage} />
      </div>
    </Display>
  )
}
