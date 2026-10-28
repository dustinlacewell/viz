import { describe, expect, it } from 'vitest'
import { CYCLE, CYCLE_SEC, HOLD_SEC, STAGE_SEC, morphAt, morphPoint } from './morph'
import { target } from './shapes'

const EPS = 1e-9

describe('morphAt', () => {
  it('runs cube → sphere → pyramid → cube', () => {
    expect(CYCLE).toEqual(['cube', 'sphere', 'pyramid'])
    expect(morphAt(0)).toMatchObject({ from: 'cube', to: 'sphere' })
    expect(morphAt(STAGE_SEC)).toMatchObject({ from: 'sphere', to: 'pyramid' })
    expect(morphAt(2 * STAGE_SEC)).toMatchObject({ from: 'pyramid', to: 'cube' })
  })

  it('holds still at the start of each stage', () => {
    for (let s = 0; s < CYCLE.length; s++) {
      expect(morphAt(s * STAGE_SEC).k).toBe(0)
      expect(morphAt(s * STAGE_SEC + HOLD_SEC).k).toBe(0)
    }
  })

  it('reaches the next shape at the end of each transition', () => {
    for (let s = 0; s < CYCLE.length; s++) {
      expect(morphAt((s + 1) * STAGE_SEC - EPS).k).toBeCloseTo(1, 6)
    }
  })

  it('eases through the middle of a transition', () => {
    const k = morphAt(HOLD_SEC + (STAGE_SEC - HOLD_SEC) / 2).k
    expect(k).toBeCloseTo(0.5, 12)
  })

  it('wraps around the cycle', () => {
    const t = 1.7
    expect(morphAt(t + CYCLE_SEC)).toEqual(morphAt(t))
    expect(morphAt(t - CYCLE_SEC).from).toBe(morphAt(t).from)
    expect(morphAt(t - CYCLE_SEC).k).toBeCloseTo(morphAt(t).k, 9)
  })
})

describe('morphPoint', () => {
  it('is the from shape during the hold', () => {
    const p = [1, 0.3, -1] as const
    expect(morphPoint(p, 0)).toEqual(target('cube', p))
  })

  it('arrives at the to shape at the end of the transition', () => {
    const p = [1, 0.3, -1] as const
    const got = morphPoint(p, STAGE_SEC - EPS)
    const want = target('sphere', p)
    for (let i = 0; i < 3; i++) expect(got[i]).toBeCloseTo(want[i]!, 6)
  })
})
