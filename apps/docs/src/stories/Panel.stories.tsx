import type { Meta, StoryObj } from '@storybook/react'
import { Panel } from '@ldlework/phosphor'

const meta: Meta<typeof Panel> = {
  title: 'Primitives/Panel',
  component: Panel,
}
export default meta

/**
 * The raised chrome plate that other controls mount on. Look at the
 * rolled edge, the rim light and the sanded grain. The label is
 * embossed text on the plate.
 */
export const Default: StoryObj<typeof Panel> = {
  render: () => (
    <Panel style={{ padding: 20, width: 320 }}>
      <div className="chrome-emboss" style={{ fontSize: 14, letterSpacing: '0.15em' }}>
        DECK A
      </div>
    </Panel>
  ),
}
