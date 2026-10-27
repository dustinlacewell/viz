import { useState } from 'react'
import { ArcGauge, Panel, type ArcGaugeProps } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_ROW } from '../components/layout'

export function ArcGaugeSection() {
  return (
    <DemoRow
      id="arcgauge"
      name="ArcGauge"
      description="The Knob's quiet sibling: the same sweep, a thin fill, no cap. Use it for a small extra value beside a main control. Drag up or down to set it; double-click to reset."
      demo={<ArcGaugeDemo />}
    />
  )
}

function ArcGaugeDemo() {
  return (
    <Panel style={PANEL_ROW}>
      <HeldGauge initial={0.5} range={[0, 1]} step={0.1} defaultValue={0.5} label="mix" />
      <HeldGauge
        initial={40}
        range={[1, 500]}
        defaultValue={40}
        label="attack"
        format={(x) => `${Math.round(x)} ms`}
      />
      <HeldGauge initial={0.7} range={[0, 1]} defaultValue={0.5} size={48} label="tone" />
    </Panel>
  )
}

/** A gauge that holds its own value. */
function HeldGauge({
  initial,
  ...props
}: Omit<ArcGaugeProps, 'value' | 'onChange'> & { initial: number }) {
  const [v, setV] = useState(initial)
  return <ArcGauge {...props} value={v} onChange={setV} />
}
