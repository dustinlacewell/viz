import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { LeverSwitch, Panel } from '@ldlework/phosphor'

const meta: Meta<typeof LeverSwitch> = {
  title: 'Primitives/LeverSwitch',
  component: LeverSwitch,
}
export default meta

export const Default: StoryObj<typeof LeverSwitch> = {
  render: () => {
    const [pos, setPos] = useState<'left' | 'right'>('left')
    return (
      <Panel style={{ padding: 20 }}>
        <LeverSwitch left="AUTO" right="MAN" position={pos} onChange={setPos} />
      </Panel>
    )
  },
}

export const Disabled: StoryObj<typeof LeverSwitch> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <LeverSwitch left="ON" right="OFF" position="right" disabled onChange={() => {}} />
    </Panel>
  ),
}
