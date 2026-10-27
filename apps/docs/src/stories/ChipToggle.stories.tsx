import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ChipToggle, Display } from '@ldlework/phosphor'

/**
 * An on/off chip on the glass of a Display. Lit means on. A faint
 * outline means off.
 */
const meta: Meta<typeof ChipToggle> = {
  title: 'Primitives/ChipToggle',
  component: ChipToggle,
}
export default meta

/**
 * The base chip with a fixed label. Click it to turn it on or off.
 * On, the chip is lit. Off, only its outline shows.
 */
export const Default: StoryObj<typeof ChipToggle> = {
  render: function Render() {
    const [on, setOn] = useState(true)
    return (
      <Display>
        <div className="screen-chip-row">
          <ChipToggle value={on} onChange={setOn}>LOOP</ChipToggle>
        </div>
      </Display>
    )
  },
}

/**
 * `onLabel` and `offLabel` give each state its own label. The chip
 * keeps the width of the longer label, so it does not change size.
 * Click it. The label changes between MONO and STEREO. The width
 * stays the same.
 */
export const StateLabels: StoryObj<typeof ChipToggle> = {
  render: function Render() {
    const [on, setOn] = useState(true)
    return (
      <Display>
        <div className="screen-chip-row">
          <ChipToggle value={on} onChange={setOn} onLabel="MONO" offLabel="STEREO" />
        </div>
      </Display>
    )
  },
}

/**
 * The host can change `children` itself when the state changes. Then
 * the chip takes the width of the label it shows. Click it. The chip
 * gets wider for STEREO and narrower for MONO. Compare with
 * StateLabels.
 */
export const DynamicLabel: StoryObj<typeof ChipToggle> = {
  render: function Render() {
    const [on, setOn] = useState(true)
    return (
      <Display>
        <div className="screen-chip-row">
          <ChipToggle value={on} onChange={setOn}>{on ? 'MONO' : 'STEREO'}</ChipToggle>
        </div>
      </Display>
    )
  },
}
