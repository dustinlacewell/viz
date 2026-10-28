import { SHAPES, type Shape } from './waveform'

/*
 * Text for the scope's lit readouts and knob captions. Pure.
 */

/** "440 Hz", "1.20 kHz". */
export function formatHz(hz: number): string {
  const whole = Math.round(hz)
  return whole >= 1000 ? `${(hz / 1000).toFixed(2)} kHz` : `${whole} Hz`
}

/** "1.00 ms/div", "250 µs/div". */
export function formatTimePerDiv(sec: number): string {
  const micros = Math.round(sec * 1_000_000)
  return micros >= 1000 ? `${(sec * 1000).toFixed(2)} ms/div` : `${micros} µs/div`
}

/** "+0.25", "-0.40", "0.00". */
export function formatLevel(v: number): string {
  const fixed = v.toFixed(2)
  if (Number(fixed) === 0) return '0.00'
  return v > 0 ? `+${fixed}` : fixed
}

/** "0.86". */
export function formatFraction(v: number): string {
  return v.toFixed(2)
}

/** "Sine". */
export function formatShape(shape: Shape): string {
  return SHAPES.find((s) => s.key === shape)?.label ?? shape
}
