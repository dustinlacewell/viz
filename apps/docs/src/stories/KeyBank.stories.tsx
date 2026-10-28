import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { KeyBank, PushButton, Panel } from '@ldlework/phosphor'

/**
 * A row of PushButtons joined into one block, like the mode keys on a
 * tape deck. The keys share their edges and cast one shadow.
 */
const meta: Meta<typeof KeyBank> = {
  title: 'Primitives/KeyBank',
  component: KeyBank,
}
export default meta

/**
 * A bank of action keys. Press and hold a key with the mouse. It goes
 * down and its label lights. Its neighbors stay up.
 */
export const Default: StoryObj<typeof KeyBank> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <KeyBank aria-label="Transport">
        <PushButton>Rew</PushButton>
        <PushButton>Play</PushButton>
        <PushButton>Stop</PushButton>
        <PushButton>FF</PushButton>
      </KeyBank>
    </Panel>
  ),
}

/**
 * A bank with one key held down by `selected`. Click a key to select
 * it. It stays down with a lit label, and the key that was selected
 * comes back up.
 */
export const SelectedKey: StoryObj<typeof KeyBank> = {
  render: function Render() {
    const [mode, setMode] = useState('Normal')
    return (
      <Panel style={{ padding: 20 }}>
        <KeyBank aria-label="Tape">
          {TAPE_MODES.map((m) => (
            <PushButton key={m} selected={mode === m} onClick={() => setMode(m)}>
              {m}
            </PushButton>
          ))}
        </KeyBank>
      </Panel>
    )
  },
}

const TAPE_MODES = ['Normal', 'Chrome', 'Metal'] as const
