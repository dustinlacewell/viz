import { target, type Shape } from './shapes'
import { lerp, type Vec3 } from './vec'

/*
 * The morph loop: cube → sphere → pyramid → cube. Each stage holds its
 * shape, then eases into the next one. Pure — a function of time.
 */

/** Seconds each shape holds still. */
export const HOLD_SEC = 1.5
/** Seconds each shape takes to ease into the next. */
export const TRANSITION_SEC = 2
export const STAGE_SEC = HOLD_SEC + TRANSITION_SEC

export const CYCLE: readonly Shape[] = ['cube', 'sphere', 'pyramid']
export const CYCLE_SEC = STAGE_SEC * CYCLE.length

export interface Morph {
  from: Shape
  to: Shape
  /** 0 = all `from`, 1 = all `to`. */
  k: number
}

/** Which two shapes blend at time `t`, and how far. */
export function morphAt(t: number): Morph {
  const tc = ((t % CYCLE_SEC) + CYCLE_SEC) % CYCLE_SEC
  const stage = Math.min(CYCLE.length - 1, Math.floor(tc / STAGE_SEC))
  const local = tc - stage * STAGE_SEC
  return {
    from: CYCLE[stage]!,
    to: CYCLE[(stage + 1) % CYCLE.length]!,
    k: smoothstep((local - HOLD_SEC) / TRANSITION_SEC),
  }
}

/** Where the cube surface point `p` sits at time `t`. */
export function morphPoint(p: Vec3, t: number): Vec3 {
  const m = morphAt(t)
  return lerp(target(m.from, p), target(m.to, p), m.k)
}

function smoothstep(x: number): number {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}
