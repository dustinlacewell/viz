import type { Meta, StoryObj } from '@storybook/react'
import { EmbeddedScreen, Panel, PushButton } from '@ldlework/phosphor'

const meta: Meta<typeof EmbeddedScreen> = {
  title: 'Primitives/EmbeddedScreen',
  component: EmbeddedScreen,
}
export default meta

/**
 * Without `bezel`: the glass meets the chrome through a single
 * chamfer, as small readouts do.
 */
export const Bare: StoryObj<typeof EmbeddedScreen> = {
  render: () => (
    <Panel style={{ padding: 20, width: 320 }}>
      <EmbeddedScreen padding={16}>
        <div className="screen-row">
          <span className="screen-row-label">Input</span>
          <span className="screen-row-readout">Line 2</span>
        </div>
      </EmbeddedScreen>
    </Panel>
  ),
}

/**
 * A screen set straight into the Panel inside its black bezel ring,
 * beside the controls that drive it. Compare Display, which is a
 * raised chassis of its own.
 */
export const OnADeviceFace: StoryObj<typeof EmbeddedScreen> = {
  render: () => (
    <Panel style={{ padding: 20, width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <EmbeddedScreen bezel padding={16}>
        <div className="screen-rows">
          <div className="screen-row">
            <span className="screen-row-label">Input</span>
            <span className="screen-row-readout">Line 2</span>
          </div>
          <div className="screen-row">
            <span className="screen-row-label">Gain</span>
            <span className="screen-row-readout">+4 dB</span>
          </div>
        </div>
      </EmbeddedScreen>
      <div style={{ display: 'flex', gap: 12 }}>
        <PushButton>Input</PushButton>
        <PushButton>Gain</PushButton>
      </div>
    </Panel>
  ),
}
