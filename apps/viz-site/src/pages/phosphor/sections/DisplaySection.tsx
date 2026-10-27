import { useState } from 'react'
import { Display, ScrubChipRow } from '@ldlework/phosphor'
import { HeroScope } from '../../../shared/scope'
import { DemoRow } from '../components/DemoRow'
import { FILL_CELL, GLASS_COLUMN, SCREEN_INSET } from '../components/layout'
import { useTunedScope } from '../components/useTunedScope'

export function DisplaySection() {
  return (
    <DemoRow
      id="oledframe"
      name="Display"
      description="The chrome-bezelled OLED display. Anything you put on the glass renders as a lit pixel — a live oscilloscope trace, the on-glass chips that drive it, and, with the cursor prop, the mouse pointer."
      demo={<DisplayDemo />}
    />
  )
}

/* Display demo: oscilloscope on the glass with two on-glass chip
   rows driving the synthetic feed. Demonstrates the "anything on the
   glass is a lit pixel" rule with a working composition. */
const FREQ_OPTIONS = [
  { key: 'slow', label: 'Slow', mul: 0.5 },
  { key: 'med', label: 'Med', mul: 1 },
  { key: 'fast', label: 'Fast', mul: 2.4 },
] as const
type FreqKey = (typeof FREQ_OPTIONS)[number]['key']
const NOISE_OPTIONS = [
  { key: 'low', label: 'Lo', n: 0.06 },
  { key: 'high', label: 'Hi', n: 0.22 },
] as const
type NoiseKey = (typeof NOISE_OPTIONS)[number]['key']

function DisplayDemo() {
  const [freq, setFreq] = useState<FreqKey>('slow')
  const [noise, setNoise] = useState<NoiseKey>('low')
  const freqMul = FREQ_OPTIONS.find((o) => o.key === freq)?.mul ?? 1
  const noiseVal = NOISE_OPTIONS.find((o) => o.key === noise)?.n ?? 0
  const preset = useTunedScope(freqMul, noiseVal)
  return (
    <Display
      style={FILL_CELL}
      padding={0}
      /* `fill` stretches the bezel + glass to the chassis height the
         grid cell gives it; without it the glass stays content-height
         and the chrome below it grows with the row.
         The scope bleeds to the screen edge; the chip rows need
         a small inset so they don't kiss the chamfer. We split:
         the scope is absolutely positioned to fill the bare screen,
         and the rows sit in a padded sibling wrapper. */
      fill
      /* The pointer over the glass is drawn as a lit pixel too. */
      cursor
      screenStyle={GLASS_COLUMN}
    >
      <div
        style={{
          /* Scope layer — absolute to the .screen parent, fills
             corner-to-corner so the trace touches the chamfer. */
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* The chips scale every fundamental's freq and set the
            noise floor. `noTuning` keeps the dev panel scoped to the
            hero scope only. */}
        {preset && <HeroScope noTuning preset={preset} />}
      </div>
      <div
        style={{
          /* Control rows — sit in the bottom inset of the screen,
             padded in from the chamfer. position:relative keeps
             them above the absolute scope layer. */
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: 8,
          padding: SCREEN_INSET,
          justifyContent: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        <div
          className="screen-row"
          style={{ gap: 12, pointerEvents: 'auto' }}
        >
          <span className="screen-row-label">Freq</span>
          <ScrubChipRow<FreqKey>
            items={FREQ_OPTIONS.map((o) => ({
              key: o.key,
              lit: o.key === freq,
              content: o.label,
            }))}
            onSelect={(k) => setFreq(k)}
          />
        </div>
        <div
          className="screen-row"
          style={{ gap: 12, pointerEvents: 'auto' }}
        >
          <span className="screen-row-label">Noise</span>
          <ScrubChipRow<NoiseKey>
            items={NOISE_OPTIONS.map((o) => ({
              key: o.key,
              lit: o.key === noise,
              content: o.label,
            }))}
            onSelect={(k) => setNoise(k)}
          />
        </div>
      </div>
    </Display>
  )
}
