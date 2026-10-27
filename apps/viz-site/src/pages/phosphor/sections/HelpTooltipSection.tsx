import { useState } from 'react'
import { HelpTooltip, Panel, Slider } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_COLUMN } from '../components/layout'

export function HelpTooltipSection() {
  return (
    <DemoRow
      id="helptooltip"
      name="HelpTooltip"
      description="A small “?” dot beside a control label. Hover it, or Tab to it, to read what the control does."
      demo={<HelpTooltipDemo />}
    />
  )
}

const CONTROLS = [
  {
    key: 'beam',
    label: 'Beam',
    help: 'How brightly the trace burns into the phosphor each frame.',
  },
  {
    key: 'decay',
    label: 'Decay',
    help: 'How long the glow lingers after the beam moves on.',
  },
] as const

function HelpTooltipDemo() {
  const [values, setValues] = useState<Record<string, number>>({ beam: 0.8, decay: 0.4 })
  return (
    <Panel style={PANEL_COLUMN}>
      {CONTROLS.map((c) => (
        <div key={c.key} className="site-row-controls">
          <span className="chrome-emboss site-row-controls-label site-help-label">
            {c.label}
            <HelpTooltip title={c.label} description={c.help} />
          </span>
          <Slider
            value={values[c.key] ?? 0}
            min={0}
            max={1}
            onChange={(v) => setValues((prev) => ({ ...prev, [c.key]: v }))}
            style={{ flex: 1 }}
          />
        </div>
      ))}
    </Panel>
  )
}
