import { describe, expect, it } from 'vitest'
import { CURSOR_ARROW } from '@ldlework/phosphor'
import { CURSOR_SQUARE_PX, cursorStamp } from '../src/cursor-stamp'

// A 200x100 screen; the stamp square is offset so the arrow tip lands on the mouse.
const half = CURSOR_SQUARE_PX / 2 - CURSOR_ARROW.inset

describe('cursorStamp', () => {
  it('centres the square down-right of the tip, in GL coordinates', () => {
    const stamp = cursorStamp({ x: 100 - half, y: 50 - half, width: 200, height: 100 }, 200, 1)
    expect(stamp?.x).toBeCloseTo(0, 10)
    expect(stamp?.y).toBeCloseTo(0, 10)
  })

  it('flips y so the top of the screen is +1', () => {
    const stamp = cursorStamp({ x: 100 - half, y: -half, width: 200, height: 100 }, 200, 1)
    expect(stamp?.y).toBeCloseTo(1, 10)
  })

  it('sizes the square in framebuffer pixels', () => {
    // A 2x framebuffer doubles the stamp's pixel size.
    const stamp = cursorStamp({ x: 0, y: 0, width: 200, height: 100 }, 400, 1)
    expect(stamp?.sizePx).toBe(CURSOR_SQUARE_PX * 2)
  })

  it('passes the intensity through', () => {
    const stamp = cursorStamp({ x: 0, y: 0, width: 200, height: 100 }, 200, 0.3)
    expect(stamp?.intensity).toBe(0.3)
  })

  it('returns null for a screen with no size', () => {
    expect(cursorStamp({ x: 0, y: 0, width: 0, height: 100 }, 200, 1)).toBeNull()
  })
})
