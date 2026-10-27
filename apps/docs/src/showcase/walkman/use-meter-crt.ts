import { useState, type RefObject } from 'react'
import { DepositPass, makeSegmentPump } from '@ldlework/scope'
import type { CrtRegion, CrtScreenProps } from '@ldlework/phosphor-crt'
import { meterBeam, type MeterMode } from './meter-beam'
import { spectrum } from './spectrum'

export interface MeterInputs {
  mode: MeterMode
  playing: boolean
  /** 0..100 */
  volume: number
  bassDb: number
  trebleDb: number
}

/** Enough segments for every block of every bar on a wide meter. */
const SEGMENT_CAPACITY = 8192

type MeterCrt = Required<Pick<CrtScreenProps, 'passes' | 'stage'>>

/**
 * The CRT wiring for the walkman meter: one beam pass, and a per-frame
 * stage that draws the meter into `region`. `inputs` is read every
 * frame, so the controls never re-render the CRT.
 */
export function useMeterCrt(inputs: RefObject<MeterInputs>, region: CrtRegion<HTMLElement>): MeterCrt {
  const [crt] = useState<MeterCrt>(() => {
    let deposit: DepositPass | null = null
    const pump = makeSegmentPump(SEGMENT_CAPACITY)
    return {
      passes: (gl) => {
        deposit = new DepositPass(gl, SEGMENT_CAPACITY)
        return [deposit]
      },
      stage: (t, dt) => {
        const rect = region.read()
        const input = inputs.current
        if (!deposit) return
        const levels = spectrum(input.playing ? t : null, input.volume / 100, input.bassDb, input.trebleDb)
        const beam = rect ? meterBeam(input.mode, levels, t, rect) : []
        deposit.setBatch(pump.pump(() => beam, t, dt))
      },
    }
  })
  return crt
}
