import type { Meta, StoryObj } from '@storybook/react'
import { HelpTooltip, Panel } from '@ldlework/phosphor'

const meta: Meta<typeof HelpTooltip> = {
  title: 'Primitives/HelpTooltip',
  component: HelpTooltip,
}
export default meta

/**
 * A "?" dot beside a control label. `title` and `description` fill the
 * popover. Hover the dot, or Tab to it, to open the popover. Move away
 * or Tab on to close it.
 */
export const Default: StoryObj<typeof HelpTooltip> = {
  render: () => (
    <Panel style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="chrome-emboss">Beam intensity</span>
      <HelpTooltip
        title="Beam intensity"
        description="How brightly the trace burns into the phosphor each frame."
      />
    </Panel>
  ),
}
