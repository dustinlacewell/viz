import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { LeverSwitch, Panel } from '@ldlework/phosphor'

/**
 * A two-position rocker. The active side glows. The other side tilts
 * back into the panel.
 */
const meta: Meta<typeof LeverSwitch> = {
  title: 'Primitives/LeverSwitch',
  component: LeverSwitch,
}
export default meta

/**
 * The base switch. `left` and `right` are the two labels. Click it to
 * flip to the other side. Or click it once, then press Space or Enter.
 */
export const Default: StoryObj<typeof LeverSwitch> = {
  render: function Render() {
    const [pos, setPos] = useState<'left' | 'right'>('left')
    return (
      <Panel style={{ padding: 20 }}>
        <LeverSwitch left="AUTO" right="MAN" position={pos} onChange={setPos} />
      </Panel>
    )
  },
}

/**
 * `disabled` dims the switch and blocks it. Click it. It does not flip.
 */
export const Disabled: StoryObj<typeof LeverSwitch> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <LeverSwitch left="INT" right="EXT" position="left" disabled onChange={() => {}} />
    </Panel>
  ),
}
