/**
 * Source definitions and the registry.
 *
 * A *source* is a named recipe that turns N sub-parameters into one
 * output value. `defineSource` builds the definition — a callable:
 * `def(args?)` builds a live `Source` (with its own fresh slots) ready
 * to attach.
 *
 * The registry exists only so the panel's "attach modulator…" picker
 * can list candidates matching a slot's output type. The library
 * itself never reaches into the registry to *evaluate* — it walks the
 * tree it's handed.
 *
 * Stateful sources (filters, integrators, seeded RNG cursors) pass a
 * `setup` instead of a `body` — a zero-arg function that returns a
 * fresh body closure. It runs once per instance so each instance has
 * its own state.
 */

import type {
  AnySourceDef,
  Body,
  ParamArgs,
  ParamsOf,
  Polarity,
  Slot,
  Source,
  SourceDef,
} from './core'
import { instantiate } from './instance'

/** The spec `defineSource` takes. Exactly one of `body` / `setup`. */
export type SourceSpec<S extends Record<string, Slot<any>>, Out> = {
  /** Globally unique name. Used by serializer + attach picker. */
  name: string
  /** Optional human-readable description of the source's character. */
  description?: string
  /** Output type tag — matches against `Slot.outType`. Default `'number'`. */
  outType?: string
  /** Normalized emission contract: `'bipolar'` [-1,1] or `'unipolar'` [0,1]. */
  polarity: Polarity
  /** Prototype param slots, e.g. `{ freq: dial(1, { min: 0.01, max: 20 }) }`. */
  params?: S
} & (
  | {
      /** Stateless body, shared by every instance. */
      body: Body<ParamsOf<S>, Out>
      setup?: never
    }
  | {
      /**
       * Stateful body factory. Runs once per instance and returns a
       * fresh body closure — two instances never share memory.
       */
      setup: () => Body<ParamsOf<S>, Out>
      body?: never
    }
)

/**
 * Define a named source. The result is callable: `def()` creates an
 * instance, `def({ freq: 3 })` one with param overrides. Body param
 * types are inferred from `params`.
 */
export function defineSource<
  S extends Record<string, Slot<any>> = {},
  Out = number,
>(spec: SourceSpec<S, Out>): SourceDef<ParamsOf<S>, Out> {
  type P = ParamsOf<S>
  if (!spec.body === !spec.setup) {
    throw new Error(`dials: source "${spec.name}" needs exactly one of body / setup`)
  }
  const def = function (args?: ParamArgs<P>) {
    return instantiate(def, args)
  } as SourceDef<P, Out>
  Object.defineProperties(def, {
    kind: { value: 'sourceDef', enumerable: true },
    name: { value: spec.name, enumerable: true },
    description: { value: spec.description, enumerable: true },
    outType: { value: spec.outType ?? 'number', enumerable: true },
    polarity: { value: spec.polarity, enumerable: true },
    params: { value: Object.freeze({ ...spec.params }), enumerable: true },
    body: { value: spec.body },
    setup: { value: spec.setup },
  })
  return Object.freeze(def)
}

/**
 * The single point where a typed source instance is stored in its erased form (`Slot.attached`); sound because the sampler only ever calls `body` with the source's own `_buf`.
 */
export function eraseSource<P extends Record<string, unknown>, T>(
  src: Source<P, T>,
): Source<Record<string, unknown>, T> {
  return src as unknown as Source<Record<string, unknown>, T>
}

// ─── Registry ─────────────────────────────────────────────────────────
//
// A single module-level registry: one source palette per process.
// Known limitation, accepted for now — two surfaces in one app cannot
// offer different palettes, and per-slot filtering is only the binary
// `meta.modulatable`. If a host ever needs scoped palettes, the shape
// is an injectable registry on the Panel (defaulting to this one), not
// more flags here.

const REGISTRY = new Map<string, AnySourceDef>()

/**
 * Register a source globally so the panel's attach picker can offer
 * it. Idempotent on `name` — re-registering with the same name
 * replaces (useful for HMR).
 */
export function registerSource<D extends AnySourceDef>(def: D): D {
  REGISTRY.set(def.name, def)
  return def
}

/**
 * Look up a registered source by name. Returns `undefined` if absent
 * — callers (notably the deserializer) decide how to handle that.
 */
export function getSource(name: string): AnySourceDef | undefined {
  return REGISTRY.get(name)
}

/**
 * List all registered sources whose `outType` matches the given tag.
 * The panel calls this to build the "attach modulator…" picker for a
 * specific slot.
 */
export function sourcesForType(outType: string): AnySourceDef[] {
  const out: AnySourceDef[] = []
  for (const def of REGISTRY.values()) {
    if (def.outType === outType) out.push(def)
  }
  return out
}

/**
 * Drop everything from the registry. Test/HMR helper.
 */
export function clearRegistry(): void {
  REGISTRY.clear()
}
