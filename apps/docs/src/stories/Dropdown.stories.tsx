import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Dropdown, Panel } from '@ldlework/phosphor'

/**
 * A native select in a raised chrome pill with a chevron. The browser
 * draws the open list.
 */
const meta: Meta<typeof Dropdown> = {
  title: 'Primitives/Dropdown',
  component: Dropdown,
}
export default meta

const WAVES = [
  { value: 'sine', label: 'Sine' },
  { value: 'tri', label: 'Triangle' },
  { value: 'saw', label: 'Sawtooth' },
  { value: 'square', label: 'Square' },
]

/**
 * The base dropdown. Click it to open the list, then pick a wave. Or
 * click it once to focus it, then press the up or down arrow key.
 */
export const Default: StoryObj<typeof Dropdown> = {
  render: function Render() {
    const [wave, setWave] = useState('sine')
    return (
      <Panel style={{ padding: 20 }}>
        <Dropdown value={wave} options={WAVES} onChange={setWave} />
      </Panel>
    )
  },
}

/**
 * `disabled` dims the dropdown and blocks it. Click it. The list does
 * not open.
 */
export const Disabled: StoryObj<typeof Dropdown> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <Dropdown value="saw" options={WAVES} onChange={() => {}} disabled />
    </Panel>
  ),
}
