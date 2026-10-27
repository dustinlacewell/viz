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

import type { Body, DialMeta, ParamArgs, Slot, Source, SourceDef } from './core'
import { clampToRange } from './space'

/**
 * Build a live source from a def: every param slot is a deep clone of
 * the def's prototype, overridden by `args`, and a stateful def's
 * `setup` runs once for this instance. Each instance carries its own
 * `_buf` (reused across samples to avoid per-frame allocation) and
 * `_keys` (cached param iteration).
 */
export function instantiate<P extends Record<string, unknown>, Out>(
  def: SourceDef<P, Out>,
  args?: ParamArgs<P>,
): Source<P, Out> {
  const params = cloneParams(def.params)
  if (args) applyArgs(def, params, args)
  return makeSource(def, params)
}

/**
 * Override fresh param clones from `args`. A plain value sets the
 * param's value and reset target; a slot is merged onto the clone.
 * Unknown keys throw; `undefined` entries are skipped.
 */
function applyArgs<P extends Record<string, unknown>>(
  def: SourceDef<P, unknown>,
  params: { [K in keyof P]: Slot<P[K]> },
  args: ParamArgs<P>,
): void {
  for (const k in args) {
    if (!Object.prototype.hasOwnProperty.call(params, k)) {
      throw new Error(`dials: source "${def.name}" has no param "${k}"`)
    }
    const arg = args[k] as P[typeof k] | Slot<P[typeof k]> | undefined
    if (arg === undefined) continue
    params[k] = isSlot(arg)
      ? mergeSlot(def.name, k, params[k], arg)
      : withHome(params[k], arg)
  }
}

function isSlot<T>(x: T | Slot<T>): x is Slot<T> {
  return typeof x === 'object' && x !== null && (x as { kind?: unknown }).kind === 'slot'
}

/**
 * A plain-value override: the value, clamped to the param's range,
 * becomes both current value and reset target.
 */
function withHome<T>(slot: Slot<T>, value: T): Slot<T> {
  const home = clampToRange(slot.dial.meta, value)
  slot.dial.value = home
  ;(slot.dial as { initial: T }).initial = home
  return slot
}

/**
 * A slot override, merged onto the prototype's clone: the passed meta
 * wins field by field over the prototype's (`undefined` fields don't
 * count); value and reset target come from the passed slot, clamped to
 * the merged range; modulation state comes from the passed slot, and
 * its attached source is adopted by reference — exactly as
 * `dial(v, { mod })` adopts — so one LFO can drive several params.
 */
function mergeSlot<T>(
  sourceName: string,
  key: string,
  proto: Slot<T>,
  arg: Slot<T>,
): Slot<T> {
  if (arg.outType !== proto.outType) {
    throw new Error(
      `dials: source "${sourceName}" param "${key}" is ${proto.outType}, ` +
        `not ${arg.outType}`,
    )
  }
  const meta = mergeMeta(proto.dial.meta, arg.dial.meta)
  if (meta.modulatable === false && arg.attached) {
    throw new Error(
      `dials: source "${sourceName}" param "${key}" is not modulatable — ` +
        `cannot give it an attached source`,
    )
  }
  return {
    kind: 'slot',
    outType: proto.outType,
    dial: {
      kind: 'dial',
      value: clampToRange(meta, arg.dial.value),
      initial: clampToRange(meta, arg.dial.initial),
      meta,
    },
    attached: arg.attached,
    modDepth: arg.modDepth,
    modMode: arg.modMode,
    glide: arg.glide,
  }
}

/** `over` wins field by field; its `undefined` fields leave `base`'s in place. */
function mergeMeta<T>(base: DialMeta<T>, over: DialMeta<T>): DialMeta<T> {
  const out: Record<string, unknown> = { ...base }
  for (const [k, v] of Object.entries(over)) if (v !== undefined) out[k] = v
  return out as DialMeta<T>
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
