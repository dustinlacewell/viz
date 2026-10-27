import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { PushButton, Panel } from '@ldlework/phosphor'

/** A raised chrome key. It goes down when you press it. */
const meta: Meta<typeof PushButton> = {
  title: 'Primitives/PushButton',
  component: PushButton,
}
export default meta

/**
 * The base key. Press and hold it with the mouse. It goes down and
 * its label lights. Release it and it comes back up.
 */
export const Default: StoryObj<typeof PushButton> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <PushButton>Play</PushButton>
    </Panel>
  ),
}

/**
 * `selected` holds the key down with a lit label. Use it for a latched
 * toggle. Click the key to latch it. Click again to release it.
 */
export const Selected: StoryObj<typeof PushButton> = {
  render: function Render() {
    const [on, setOn] = useState(false)
    return (
      <Panel style={{ padding: 20 }}>
        <PushButton selected={on} onClick={() => setOn((s) => !s)}>
          Loop
        </PushButton>
      </Panel>
    )
  },
}

/**
 * `pressed` puts the key down when the host says so, not the mouse.
 * Use it to show a key shortcut on the key. Click the story canvas,
 * then hold the T key on the keyboard. The key goes down. Release T
 * and it comes back up.
 */
export const Pressed: StoryObj<typeof PushButton> = {
  render: function Render() {
    const held = useKeyHeld('t')
    return (
      <Panel style={{ padding: 20 }}>
        <PushButton pressed={held}>Tap</PushButton>
      </Panel>
    )
  },
}

/**
 * `sizer` sets the content that sizes the key. Put every label in it,
 * and the key keeps the width of the longest one. Click each key. Its
 * label changes between Record and Stop. The top key has no `sizer`,
 * so it changes width. The bottom key has a `sizer`, so it does not.
 */
export const Sizer: StoryObj<typeof PushButton> = {
  render: function Render() {
    const [plain, setPlain] = useState(false)
    const [sized, setSized] = useState(false)
    return (
      <Panel style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
        <PushButton onClick={() => setPlain((s) => !s)}>{plain ? 'Stop' : 'Record'}</PushButton>
        <PushButton
          sizer={
            <>
              <span>Record</span>
              <span>Stop</span>
            </>
          }
          onClick={() => setSized((s) => !s)}
        >
          {sized ? 'Stop' : 'Record'}
        </PushButton>
      </Panel>
    )
  },
}

/**
 * `disabled` dims the key and blocks it. Try to press it. It does not
 * go down.
 */
export const Disabled: StoryObj<typeof PushButton> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <PushButton disabled>Mute</PushButton>
    </Panel>
  ),
}

/** True while the given key is held down anywhere in the window. */
function useKeyHeld(key: string): boolean {
  const [held, setHeld] = useState(false)
  useEffect(() => {
    const down = (e: KeyboardEvent) => e.key.toLowerCase() === key && setHeld(true)
    const up = (e: KeyboardEvent) => e.key.toLowerCase() === key && setHeld(false)
    const release = () => setHeld(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', release)
    }
  }, [key])
  return held
}
