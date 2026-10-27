import { describe, expect, it } from 'vitest'
import { commitDraft, liveDraftValue, parseDraft } from '../src/primitives/number-draft'

describe('parseDraft', () => {
  it('reads finite numbers', () => {
    expect(parseDraft('12')).toBe(12)
    expect(parseDraft('-0.5')).toBe(-0.5)
    expect(parseDraft('.5')).toBe(0.5)
  })

  it('rejects empty and partial text instead of reading 0', () => {
    for (const t of ['', ' ', '-', '.', '-.', 'e', '1e']) expect(parseDraft(t)).toBeNull()
  })
})

describe('liveDraftValue', () => {
  it('emits in-range numbers while typing', () => {
    expect(liveDraftValue('12', 5, 20)).toBe(12)
    expect(liveDraftValue('3', undefined, undefined)).toBe(3)
  })

  it('holds back out-of-range numbers so typing can continue', () => {
    // "1" on the way to "12" with min 5.
    expect(liveDraftValue('1', 5, 20)).toBeNull()
    expect(liveDraftValue('25', 5, 20)).toBeNull()
  })

  it('holds back partial text', () => {
    expect(liveDraftValue('', 0, 10)).toBeNull()
    expect(liveDraftValue('-', -10, 10)).toBeNull()
  })
})

describe('commitDraft', () => {
  it('clamps a number to the range', () => {
    expect(commitDraft('1', 7, 5, 20)).toBe(5)
    expect(commitDraft('99', 7, 5, 20)).toBe(20)
    expect(commitDraft('12', 7, 5, 20)).toBe(12)
  })

  it('reverts partial text to the current value', () => {
    expect(commitDraft('', 7, 5, 20)).toBe(7)
    expect(commitDraft('-', 7)).toBe(7)
    expect(commitDraft('-.', 7)).toBe(7)
  })

  it('leaves an open side unbounded', () => {
    expect(commitDraft('-1000', 0, undefined, 10)).toBe(-1000)
    expect(commitDraft('1000', 0, 0)).toBe(1000)
  })
})
