/**
 * Whole-record cloning and body adoption, built on `cloneSlot`
 * (see `instance.ts` for the clone semantics).
 */

import type { Dials, Slot, Source } from './core'
import { cloneSlot } from './instance'

/** Deep-clone a whole dials record. */
export function cloneDials(dials: Dials): Dials {
  const out: Dials = {}
  for (const key in dials) out[key] = cloneSlot(dials[key] as Slot<unknown>)
  return out
}

/**
 * Carry a live source's per-instance body state across a
 * re-instantiation of the same def.
 *
 * `cloneSlot` deliberately gives every clone a fresh stateful body — two
 * *sibling* instances must never share an LFO's phase or a filter's
 * memory. But a host that periodically RE-materializes the same logical
 * instance (herder recompiling its mirror after a structural edit) wants
 * the opposite: the new instance should continue where the old one left
 * off, not restart. This transplants the resolved body closure — the
 * whole of a source's per-instance state — from the retiring instance
 * into its successor, leaving the successor's own (freshly merged)
 * param slots untouched.
 *
 * Guarded by def identity: a different def (the attachment changed, or
 * HMR re-registered the source) means the old closure's shape can't be
 * trusted, so the successor keeps its fresh body. Stateless defs share
 * the def's own body function on every instance — the assignment is a
 * no-op there.
 */
export function adoptBody<T>(
  from: Source<Record<string, unknown>, T>,
  into: Source<Record<string, unknown>, T>,
): void {
  if (from === into || from.def !== into.def) return
  ;(into as { body: Source<Record<string, unknown>, T>['body'] }).body = from.body
}
