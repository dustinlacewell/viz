import { describe, expect, it } from 'vitest'
import { isOnScreen, toScreenPoint } from '../src/primitives/screen-point'

describe('toScreenPoint', () => {
  it('offsets a viewport point by the screen origin', () => {
    const box = { left: 100, top: 50, width: 200, height: 100 }
    const layout = { width: 200, height: 100 }
    expect(toScreenPoint({ x: 130, y: 70 }, box, layout)).toEqual({ x: 30, y: 20 })
  })

  it('divides out a CSS scale on the screen', () => {
    // Laid out at 200x100, drawn at 2x.
    const box = { left: 0, top: 0, width: 400, height: 200 }
    const layout = { width: 200, height: 100 }
    expect(toScreenPoint({ x: 100, y: 60 }, box, layout)).toEqual({ x: 50, y: 30 })
  })

  it('does not divide by zero for an empty box', () => {
    const box = { left: 10, top: 10, width: 0, height: 0 }
    const layout = { width: 0, height: 0 }
    expect(toScreenPoint({ x: 15, y: 12 }, box, layout)).toEqual({ x: 5, y: 2 })
  })
})

describe('isOnScreen', () => {
  const layout = { width: 200, height: 100 }

  it('accepts points on the glass, edges included', () => {
    expect(isOnScreen({ x: 0, y: 0 }, layout)).toBe(true)
    expect(isOnScreen({ x: 200, y: 100 }, layout)).toBe(true)
  })

  it('rejects points off the glass', () => {
    expect(isOnScreen({ x: -1, y: 50 }, layout)).toBe(false)
    expect(isOnScreen({ x: 50, y: 101 }, layout)).toBe(false)
  })
})
