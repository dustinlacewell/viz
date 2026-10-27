import { describe, expect, it } from 'vitest'
import { scrubStep, startScrub } from '../src/primitives/scrub-step'

function run(start: string, path: string[]) {
  let state = startScrub(start)
  const fired: string[] = []
  for (const k of path) {
    const r = scrubStep(state, k)
    state = r.state
    fired.push(...r.fire)
  }
  return { state, fired }
}

describe('scrubStep', () => {
  it('fires nothing while the pointer stays on the start chip', () => {
    const { state, fired } = run('a', ['a', 'a'])
    expect(fired).toEqual([])
    expect(state.moved).toBe(false)
  })

  it('includes the start chip on the first move off it', () => {
    expect(run('a', ['b']).fired).toEqual(['a', 'b'])
  })

  it('fires each new chip once after the first move', () => {
    expect(run('a', ['b', 'b', 'c', 'd']).fired).toEqual(['a', 'b', 'c', 'd'])
  })

  it('fires the start chip again when the drag returns to it', () => {
    expect(run('b', ['c', 'b']).fired).toEqual(['b', 'c', 'b'])
  })

  it('marks the press as moved so the tap path stays silent', () => {
    expect(run('a', ['b']).state.moved).toBe(true)
  })
})
