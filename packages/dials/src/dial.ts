/**
 * The leaf primitive — a user-tunable value with UI metadata.
 *
 * Two ways to construct:
 *
 *   dial(0.5, { min: 0, max: 1, label: 'amp' })   // numeric, type tag 'number'
 *   typedDial<RGB>('rgb', [1, 0, 0])              // arbitrary type with explicit tag
 *
 * The type tag is what the registry uses to decide which sources can
 * be attached. For numbers it's `'number'`; for anything else the
 * caller declares the tag they want to identify the type by.
 *
 * Either can start modulated: `dial(1, { min: 0, max: 2, mod: sine(), depth: 0.3 })`.
 */

import type { Dial, DialMeta, ModMode, Slot, Source } from './core'
import { attach, setDepth, setMode } from './attach'
import { clampToRange, fromPos, toPos, validRange, type RangeMeta } from './space'

/** Construction-time modulation state for a dial. */
export interface ModInit<T> {
  /** A source instance to attach. */
  mod?: Source<any, T>
  /** Modulation depth. Applied after `mod`, so an explicit 0 survives attach. */
  depth?: number
  /** Modulation mode. */
  mode?: ModMode
  /** Glide time constant, seconds. */
  glide?: number
}

/** The options `dial` / `typedDial` take: display meta plus initial modulation state. */
export type DialOptions<T> = DialMeta<T> & ModInit<T>

/**
 * Numeric dial — the common case. Type tag is always `'number'`.
 */
export function dial(value: number, opts: DialOptions<number> = {}): Slot<number> {
  return buildSlot('number', value, opts)
}

/**
 * Typed dial — when the value isn't a plain number. The `type` arg is
 * the tag the registry will match against when filtering sources you
 * can attach to this dial. Pick stable strings: 'rgb', 'vec2', 'bool',
 * 'oklch', etc.
 */
export function typedDial<T>(
  type: string,
  value: T,
  opts: DialOptions<T> = {},
): Slot<T> {
  return buildSlot(type, value, opts)
}

/**
 * Split the options into code-owned meta (stored on the dial, shared by
 * clones — never holds a live source) and slot state, then apply the
 * state: mode and glide, then the attachment, then depth.
 */
function buildSlot<T>(type: string, value: T, opts: DialOptions<T>): Slot<T> {
  const { mod, depth, mode, glide, ...meta } = opts
  const slot = slotFromDial<T>(type, { kind: 'dial', value, initial: value, meta })
  if (mode !== undefined) setMode(slot, mode)
  if (glide !== undefined) setGlide(slot, glide)
  if (mod) {
    if (meta.modulatable === false) {
      throw new Error('dials: cannot give `mod` to a dial with modulatable: false')
    }
    attach(slot, mod)
  }
  if (depth !== undefined) setDepth(slot, depth)
  return slot
}

/**
 * Wrap a fresh `Dial<T>` in a slot with no source attached and default
 * slot state.
 */
export function slotFromDial<T>(type: string, dial: Dial<T>): Slot<T> {
  return {
    kind: 'slot',
    outType: type,
    dial,
    attached: null,
    modDepth: 0,
    modMode: 'center',
    glide: 0,
  }
}

/**
 * Set a dial's value, in the dial's own units. Equivalent to
 * `slot.dial.value = v` but clamps to `min`/`max` when both are
 * defined and `T = number`.
 */
export function setDial<T>(slot: Slot<T>, value: T): void {
  slot.dial.value = clampToRange(slot.dial.meta, value)
}

/**
 * Set a dial by its position in its range: 0 is `min`, 1 is `max`,
 * following a log scale when the dial has one. Throws when the dial
 * has no valid `min`/`max`.
 */
export function setPos(slot: Slot<number>, pos: number): void {
  slot.dial.value = fromPos(rangeOf(slot), pos)
}

/**
 * A dial's value as a position in its range, 0 to 1 — the inverse of
 * `setPos`. Reads the base value, not the modulated one. Throws when
 * the dial has no valid `min`/`max`.
 */
export function getPos(slot: Slot<number>): number {
  return toPos(rangeOf(slot), slot.dial.value)
}

function rangeOf(slot: Slot<number>): RangeMeta {
  const meta = slot.dial.meta
  if (!validRange(meta)) throw new Error(`dials: dial "${meta.label ?? '?'}" has no min/max range`)
  return meta
}

/**
 * Re-home a slot: its CURRENT value becomes the reset target
 * (`dial.initial` — what editors return to on double-click / Home).
 * Recurses through an attached source's sub-slots. This is the one
 * sanctioned writer of `initial`, for hosts whose slot trees are
 * cloned projections of a live prototype — an instance's knobs
 * inherit the prototype's current state as their defaults.
 */
export function rebaseSlot(slot: Slot<unknown>): void {
  ;(slot.dial as { initial: unknown }).initial = slot.dial.value
  if (slot.attached)
    for (const k in slot.attached.params)
      rebaseSlot(slot.attached.params[k] as Slot<unknown>)
}

/**
 * Set the slot's glide time constant, clamped to `>= 0` seconds.
 * Slot-level state like `modDepth`/`modMode` — works whether or not a
 * source is attached, and survives detach/reattach. The sampler slews
 * the slot's combined output through it (see `Slot.glide`).
 */
export function setGlide(slot: Slot<unknown>, seconds: number): void {
  slot.glide = Math.max(0, seconds)
}
