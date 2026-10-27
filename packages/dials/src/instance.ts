/**
 * Live instances: building a `Source` from a def, and deep-cloning slot
 * trees. One module because the two recurse into each other — an
 * instance's param slots are clones of the def's prototypes, and a
 * cloned slot's attached source is a fresh instance.
 *
 * A `Slot` is not spreadable: it carries a live `Source` whose body may
 * close over per-instance mutable state (an LFO's phase, a filter's
 * memory, an RNG cursor). Two instances of one prototype must NOT share
 * that state, so every clone re-resolves the body of every attached
 * source.
 *
 * `cloneSlot` produces a fresh slot with:
 *   - a fresh `dial` (copied value / initial / meta — meta is shared by
 *     reference, since it is code-owned, immutable UI metadata; all
 *     user-tunable state lives on the slot),
 *   - the same `modDepth` / `modMode` / `glide` (plain values),
 *   - a fresh `Source` (stateful bodies get their own closure) whose
 *     sub-slots are themselves cloned recursively.
 *
 * The result is independent: sampling the clone never advances the
 * original's sources and vice versa. `lastSample` / `_glideY` are NOT
 * copied — they are sampler scratch, seeded fresh on first sample.
 */

import type { Body, Slot, Source, SourceDef } from './core'

/**
 * Build a live source from a def: every param slot is a deep clone of
 * the def's prototype, and a stateful def's `setup` runs once for this
 * instance. Each instance carries its own `_buf` (reused across samples
 * to avoid per-frame allocation) and `_keys` (cached param iteration).
 */
export function instantiate<P extends Record<string, unknown>, Out>(
  def: SourceDef<P, Out>,
): Source<P, Out> {
  return makeSource(def, cloneParams(def.params))
}

/** Deep-clone one slot and its entire attached-source subtree. */
export function cloneSlot<T>(slot: Slot<T>): Slot<T> {
  return {
    kind: 'slot',
    outType: slot.outType,
    dial: {
      kind: 'dial',
      value: slot.dial.value,
      initial: slot.dial.initial,
      meta: slot.dial.meta,
    },
    attached: slot.attached ? cloneSource(slot.attached) : null,
    modDepth: slot.modDepth,
    modMode: slot.modMode,
    glide: slot.glide,
  }
}

/** A fresh instance of the same def, with each sub-slot cloned from the original's. */
function cloneSource<T>(
  src: Source<Record<string, unknown>, T>,
): Source<Record<string, unknown>, T> {
  return makeSource(src.def, cloneParams(src.params))
}

function cloneParams<P extends Record<string, unknown>>(
  params: { readonly [K in keyof P]: Slot<P[K]> },
): { [K in keyof P]: Slot<P[K]> } {
  const out = {} as { [K in keyof P]: Slot<P[K]> }
  for (const k in params) out[k] = cloneSlot(params[k])
  return out
}

function makeSource<P extends Record<string, unknown>, Out>(
  def: SourceDef<P, Out>,
  params: { [K in keyof P]: Slot<P[K]> },
): Source<P, Out> {
  return {
    kind: 'source',
    def,
    params,
    body: resolveBody(def),
    _buf: {} as P,
    _keys: Object.keys(params) as (keyof P & string)[],
  }
}

/** A stateless def shares its body; a stateful def gets a fresh, tick-guarded closure. */
function resolveBody<P extends Record<string, unknown>, Out>(
  def: SourceDef<P, Out>,
): Body<P, Out> {
  if (def.setup) return guardPerTick(def.setup())
  return def.body!
}

/**
 * Per-tick guard for stateful bodies. A stateful source integrates its
 * closure state by `dt` inside the body — so it must run exactly once
 * per time tick, no matter how many slots ride it or how many times a
 * host samples the tree within one frame. Repeated samples at the same
 * `ctx.t` return the tick's cached output; the body only advances when
 * `t` moves. This is what makes the sampler's documented contract —
 * "sample twice with the same ctx, get the same answer twice" — hold
 * for stateful sources.
 */
function guardPerTick<P extends Record<string, unknown>, Out>(
  fn: Body<P, Out>,
): Body<P, Out> {
  let lastT: number | undefined
  let lastOut: Out
  let primed = false
  return (params, ctx) => {
    const t = ctx['t']
    if (typeof t === 'number' && primed && t === lastT) return lastOut
    lastT = typeof t === 'number' ? t : undefined
    lastOut = fn(params, ctx)
    primed = true
    return lastOut
  }
}
