import { describe, expect, it, vi } from 'vitest'
import { createScreenPointer } from '../src/primitives/screen-pointer'

const SAMPLE = { x: 10, y: 20, width: 200, height: 100 }

describe('createScreenPointer', () => {
  it('starts off the glass and unclaimed', () => {
    const pointer = createScreenPointer()
    expect(pointer.get()).toBeNull()
    expect(pointer.claimed()).toBe(false)
  })

  it('stores the latest sample and notifies', () => {
    const pointer = createScreenPointer()
    const listener = vi.fn()
    pointer.subscribe(listener)
    pointer.set(SAMPLE)
    expect(pointer.get()).toEqual(SAMPLE)
    pointer.set(null)
    expect(pointer.get()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('stops notifying after unsubscribe', () => {
    const pointer = createScreenPointer()
    const listener = vi.fn()
    const unsubscribe = pointer.subscribe(listener)
    unsubscribe()
    pointer.set(SAMPLE)
    expect(listener).not.toHaveBeenCalled()
  })

  it('stays claimed until every claim is released', () => {
    const pointer = createScreenPointer()
    const releaseA = pointer.claim()
    const releaseB = pointer.claim()
    releaseA()
    expect(pointer.claimed()).toBe(true)
    releaseB()
    expect(pointer.claimed()).toBe(false)
  })

  it('ignores a second release of the same claim', () => {
    const pointer = createScreenPointer()
    const releaseA = pointer.claim()
    const releaseB = pointer.claim()
    releaseA()
    releaseA()
    expect(pointer.claimed()).toBe(true)
    releaseB()
    expect(pointer.claimed()).toBe(false)
  })

  it('notifies on claim and release', () => {
    const pointer = createScreenPointer()
    const listener = vi.fn()
    pointer.subscribe(listener)
    const release = pointer.claim()
    release()
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
