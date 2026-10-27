import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ArcGauge, Panel, type ArcGaugeProps } from '@ldlework/phosphor'

/**
 * The Knob's quiet sibling. It has the same sweep, but no cap and a thin
 * fill. Use it for a small extra value beside a main control.
 */
const meta: Meta<typeof ArcGauge> = {
  title: 'Primitives/ArcGauge',
  component: ArcGauge,
}
export default meta

/**
 * The base gauge. The fill runs from the start to the value.
 * Drag up or down to change the value. Hold Shift for fine moves.
 * Click the gauge, then use the arrow keys. Double-click or press
 * Home to reset it to `defaultValue`.
 */
export const Default: StoryObj<typeof ArcGauge> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <HeldGauge initial={0.25} range={[0, 1]} defaultValue={0.5} label="mix" />
    </Panel>
  ),
}

/**
 * `step` snaps the value to whole steps. Drag, or click the gauge and
 * press the arrow keys. Each key press moves one step of 0.1.
 */
export const Step: StoryObj<typeof ArcGauge> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <HeldGauge initial={0.5} range={[0, 1]} step={0.1} label="mix" />
    </Panel>
  ),
}

/**
 * `format` writes the readout. Here it shows the value in whole
 * milliseconds. Drag up or down and read the value under the arc.
 */
export const Format: StoryObj<typeof ArcGauge> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <HeldGauge
        initial={40}
        range={[1, 500]}
        label="attack"
        format={(x) => `${Math.round(x)} ms`}
      />
    </Panel>
  ),
}

/**
 * `size` sets the arc diameter in px. The default is 26. Drag either
 * gauge up or down. Both work the same.
 */
export const Size: StoryObj<typeof ArcGauge> = {
  render: () => (
    <Panel style={{ padding: 20, display: 'flex', alignItems: 'flex-end', gap: 24 }}>
      <HeldGauge initial={0.4} range={[0, 1]} label="mix" />
      <HeldGauge initial={0.7} range={[0, 1]} size={48} label="tone" />
    </Panel>
  ),
}

/** A gauge that holds its own value. */
function HeldGauge({
  initial,
  ...props
}: Omit<ArcGaugeProps, 'value' | 'onChange'> & { initial: number }) {
  const [v, setV] = useState(initial)
  return <ArcGauge {...props} value={v} onChange={setV} />
}
