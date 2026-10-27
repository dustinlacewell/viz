import { useState } from 'react'
import { NumberField, Panel, type NumberFieldProps } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_COLUMN } from '../components/layout'

export function NumberFieldSection() {
  return (
    <DemoRow
      id="numberfield"
      name="NumberField"
      description="A number you type, in a dark slot with a lit readout. The arrow keys step it. Voices stops at 1 and 16; a typed value outside that snaps back when you press Enter."
      demo={<NumberFieldDemo />}
    />
  )
}

function NumberFieldDemo() {
  return (
    <Panel style={PANEL_COLUMN}>
      <LabeledField label="Freq Hz" initial={440} width={80} />
      <LabeledField label="Gain" initial={0.5} step={0.05} width={80} />
      <LabeledField label="Voices" initial={4} min={1} max={16} width={80} />
    </Panel>
  )
}

/** An embossed label beside a field that holds its own value. */
function LabeledField({
  label,
  initial,
  ...props
}: Omit<NumberFieldProps, 'value' | 'onChange'> & { label: string; initial: number }) {
  const [v, setV] = useState(initial)
  return (
    <div className="site-row-controls">
      <span className="chrome-emboss site-row-controls-label">{label}</span>
      <NumberField {...props} value={v} onChange={setV} />
    </div>
  )
}
