import type { Fundamental } from '@ldlework/scope'

/*
 * The scope's input waveforms, built as sums of scope fundamentals
 * (Fourier series). Pure — no state, no I/O.
 */

export type Shape = 'sine' | 'square' | 'saw' | 'noise'

export const SHAPES: readonly { key: Shape; label: string }[] = [
  { key: 'sine', label: 'Sine' },
  { key: 'square', label: 'Square' },
  { key: 'saw', label: 'Saw' },
  { key: 'noise', label: 'Noise' },
]

/** Most harmonic terms one shape may use. */
export const MAX_HARMONICS = 15
/** Harmonics above this frequency are dropped, so high notes stay clean. */
export const MAX_HARMONIC_HZ = 20_000

/**
 * The fundamentals that sum to `shape` at `freqHz` with peak `amp`.
 * Noise has none: the noise floor carries it.
 */
export function shapeFundamentals(shape: Shape, freqHz: number, amp: number): Fundamental[] {
  switch (shape) {
    case 'sine':
      return [{ freq: freqHz, amp, phase: 0 }]
    case 'square':
      return harmonics(freqHz, oddOrders(), (n) => term(freqHz, n, (amp * 4) / (Math.PI * n), 0))
    case 'saw':
      return harmonics(freqHz, allOrders(), (n) => term(freqHz, n, (amp * 2) / (Math.PI * n), sawPhase(n)))
    case 'noise':
      return []
  }
}

/** Builds one term per order, capped by count and by frequency. */
function harmonics(freqHz: number, orders: number[], make: (n: number) => Fundamental): Fundamental[] {
  return orders.filter((n) => freqHz * n <= MAX_HARMONIC_HZ).map(make)
}

function term(freqHz: number, n: number, amp: number, phase: number): Fundamental {
  return { freq: freqHz * n, amp, phase }
}

/** Odd orders 1, 3, 5, … — MAX_HARMONICS of them. */
function oddOrders(): number[] {
  return Array.from({ length: MAX_HARMONICS }, (_, i) => 2 * i + 1)
}

/** All orders 1, 2, 3, … — MAX_HARMONICS of them. */
function allOrders(): number[] {
  return Array.from({ length: MAX_HARMONICS }, (_, i) => i + 1)
}

/* The saw's series alternates sign. A half-turn of phase flips a term,
   so the amplitude stays positive. */
function sawPhase(n: number): number {
  return n % 2 === 0 ? Math.PI : 0
}
