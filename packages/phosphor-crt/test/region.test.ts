import { describe, expect, it } from 'vitest'
import { regionToNdc } from '../src/region'

const CRT = { left: 100, top: 50, width: 200, height: 100 }

describe('regionToNdc', () => {
  it('maps the whole CRT to -1..1 with y up', () => {
    expect(regionToNdc(CRT, CRT)).toEqual({
      left: -1, right: 1, top: 1, bottom: -1, width: 200, height: 100,
    })
  })

  it('maps a box in the bottom-right quarter', () => {
    const box = { left: 200, top: 100, width: 100, height: 50 }
    expect(regionToNdc(box, CRT)).toEqual({
      left: 0, right: 1, top: 0, bottom: -1, width: 100, height: 50,
    })
  })

  it('returns null for a CRT with no size', () => {
    expect(regionToNdc(CRT, { ...CRT, width: 0 })).toBeNull()
  })
})
