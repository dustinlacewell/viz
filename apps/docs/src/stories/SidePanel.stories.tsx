import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Display, Panel, PushButton, SidePanel } from '@ldlework/phosphor'

const meta: Meta<typeof SidePanel> = {
  title: 'Primitives/SidePanel',
  component: SidePanel,
  parameters: {
    // The panel is fixed to the viewport edge and is 100vh tall. Give
    // each story its own viewport: the canvas, or an iframe in docs.
    layout: 'fullscreen',
    docs: { story: { inline: false, iframeHeight: 420 } },
  },
}
export default meta

/** The settings the panel holds, as label / value rows on the glass. */
function Settings() {
  return (
    <Display raised={false}>
      <div className="screen-rows">
        <div className="screen-row">
          <span className="screen-row-label">beam</span>
          <span className="screen-row-readout">0.80</span>
        </div>
        <div className="screen-row">
          <span className="screen-row-label">decay</span>
          <span className="screen-row-readout">120 ms</span>
        </div>
      </div>
    </Display>
  )
}

/**
 * The panel docks to the right edge. Click the chevron tab on its left
 * side to slide it off the edge. Only the tab stays in view. Click the
 * tab again to bring the panel back.
 */
export const Default: StoryObj<typeof SidePanel> = {
  render: function Render() {
    const [open, setOpen] = useState(true)
    return (
      <SidePanel open={open} onToggle={() => setOpen((o) => !o)}>
        <Settings />
      </SidePanel>
    )
  },
}

/**
 * `side="left"` docks the panel to the left edge, with the tab on its
 * right side. Click the tab to slide the panel off and back.
 */
export const Left: StoryObj<typeof SidePanel> = {
  render: function Render() {
    const [open, setOpen] = useState(true)
    return (
      <SidePanel open={open} onToggle={() => setOpen((o) => !o)} side="left">
        <Settings />
      </SidePanel>
    )
  },
}

const WIDTHS = [280, 380, 480] as const

/**
 * `width` sets the panel width in px. The default is 380. Press 280,
 * 380 or 480; the panel takes that width.
 */
export const Width: StoryObj<typeof SidePanel> = {
  render: function Render() {
    const [open, setOpen] = useState(true)
    const [width, setWidth] = useState<number>(380)
    return (
      <>
        <div style={{ padding: 20 }}>
          <Panel style={{ padding: 20, display: 'inline-flex', gap: 12 }}>
            {WIDTHS.map((w) => (
              <PushButton key={w} selected={w === width} onClick={() => setWidth(w)}>
                {w}
              </PushButton>
            ))}
          </Panel>
        </div>
        <SidePanel open={open} onToggle={() => setOpen((o) => !o)} width={width}>
          <Settings />
        </SidePanel>
      </>
    )
  },
}
