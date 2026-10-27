/*
 * Decimal places a quantization step needs to print exactly:
 * 1 → 0, 0.1 → 1, 0.25 → 2. Capped at 4 so a tiny step cannot
 * blow up a readout. Pure — no DOM.
 */
const MAX_DECIMALS = 4

export function stepDecimals(step: number): number {
  const abs = Math.abs(step)
  for (let d = 0; d < MAX_DECIMALS; d++) {
    const scaled = abs * 10 ** d
    if (Math.abs(scaled - Math.round(scaled)) < 1e-9 * Math.max(1, scaled)) return d
  }
  return MAX_DECIMALS
}
