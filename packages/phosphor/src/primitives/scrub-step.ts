/**
 * Drag-scrub state for one press: the chip the press started on, the
 * chip last seen under the pointer, and whether the pointer has left
 * the start chip yet (a press that never leaves is a tap).
 */
export interface ScrubState<K> {
  start: K
  last: K
  moved: boolean
}

export function startScrub<K>(start: K): ScrubState<K> {
  return { start, last: start, moved: false }
}

/**
 * Advance the scrub to the chip now under the pointer. Returns the
 * keys to select, in order. The first move off the start chip selects
 * the start chip too, so a drag includes the chip it began on exactly
 * as if the pointer had entered it.
 */
export function scrubStep<K>(
  state: ScrubState<K>,
  next: K,
): { state: ScrubState<K>; fire: K[] } {
  if (next === state.last) return { state, fire: [] }
  const fire = state.moved ? [next] : [state.start, next]
  return { state: { start: state.start, last: next, moved: true }, fire }
}
