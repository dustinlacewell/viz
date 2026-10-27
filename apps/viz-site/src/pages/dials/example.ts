import { dial, read, sine } from '@ldlework/dials'

export const params = {
  freq: dial(2, { min: 0.1, max: 12, step: 0.1 }),
  // amp rides a 1 Hz sine, 0.4 either side of its knob value.
  amp: dial(0.6, { min: 0, max: 1, step: 0.01, mod: sine({ freq: 1 }), depth: 0.4 }),
}

let last = 0
let phase = 0

// Pull the current values and return one point of the wave.
export function sample(t: number): number {
  const dt = t - last
  last = t
  const { freq, amp } = read(params, { t, dt })
  phase += freq * dt
  return amp * Math.sin(2 * Math.PI * phase)
}
