/*
 * Log mapping between a slider position in [0, 1] and a value in
 * [min, max] (min > 0). The value — not the position — snaps to
 * `step`, then clamps to the range. Pure — no DOM.
 */
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function logPosition(value: number, min: number, max: number): number {
  const logMin = Math.log(min)
  return (Math.log(Math.max(value, min)) - logMin) / (Math.log(max) - logMin)
}

export function logValue(pos: number, min: number, max: number, step?: number): number {
  const logMin = Math.log(min)
  const raw = Math.exp(logMin + pos * (Math.log(max) - logMin))
  return clamp(step ? Math.round(raw / step) * step : raw, min, max)
}
