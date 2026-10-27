import { describe, expect, it } from 'vitest'
import { placePopover } from '../src/primitives/popover-place'

const viewport = { width: 800, height: 600 }
const opts = { gap: 4, margin: 6 }
const size = { width: 100, height: 50 }

function rect(left: number, top: number, width: number, height: number) {
  return { left, top, right: left + width, bottom: top + height }
}

describe('placePopover', () => {
  it('hangs below the trigger, right edges aligned by default', () => {
    expect(placePopover(rect(300, 100, 20, 20), size, viewport, opts)).toEqual({
      top: 124,
      left: 220,
      above: false,
    })
  })

  it('centers on the trigger with align center', () => {
    const p = placePopover(rect(300, 100, 20, 20), size, viewport, { ...opts, align: 'center' })
    expect(p.left).toBe(260)
  })

  it('centers on a zero-size anchor', () => {
    const p = placePopover(rect(400, 100, 0, 0), size, viewport, { ...opts, align: 'center' })
    expect(p).toEqual({ top: 104, left: 350, above: false })
  })

  it('flips above when the bottom would clip', () => {
    expect(placePopover(rect(300, 560, 20, 20), size, viewport, opts)).toEqual({
      top: 506,
      left: 220,
      above: true,
    })
  })

  it('stays below when there is no room above either', () => {
    const tall = { width: 100, height: 590 }
    const p = placePopover(rect(300, 20, 20, 20), tall, viewport, opts)
    expect(p.above).toBe(false)
    expect(p.top).toBe(44)
  })

  it('clamps to the left margin', () => {
    const p = placePopover(rect(10, 100, 20, 20), size, viewport, opts)
    expect(p.left).toBe(6)
  })

  it('clamps to the right margin', () => {
    const p = placePopover(rect(780, 100, 20, 20), size, viewport, { ...opts, align: 'center' })
    expect(p.left).toBe(694)
  })
})
