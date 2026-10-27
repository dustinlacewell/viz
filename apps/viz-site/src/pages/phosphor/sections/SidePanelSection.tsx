import { useState } from 'react'
import { Display, Panel, PushButton, SidePanel } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_COLUMN } from '../components/layout'
import { ScreenRows } from '../components/ScreenRows'

export function SidePanelSection() {
  return (
    <DemoRow
      id="sidepanel"
      name="SidePanel"
      description="A chrome chassis docked to an edge of the window. Its tab slides it off the edge and back. Press Dock to put one on this page."
      demo={<SidePanelDemo />}
    />
  )
}

type Side = 'left' | 'right'
const SIDES: ReadonlyArray<{ key: Side; label: string }> = [
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
]

const SETTINGS = [
  ['beam', '0.80'],
  ['decay', '120 ms'],
] as const

/* The SidePanel is fixed to the window, so it only mounts after the
   user docks it: on load nothing covers the page. */
function SidePanelDemo() {
  const [docked, setDocked] = useState(false)
  const [open, setOpen] = useState(true)
  const [side, setSide] = useState<Side>('right')
  const toggleDock = () => {
    setDocked((d) => !d)
    setOpen(true)
  }
  return (
    <>
      <Panel style={PANEL_COLUMN}>
        <div className="site-row-controls">
          <span className="chrome-emboss site-row-controls-label">Panel</span>
          <PushButton
            selected={docked}
            onClick={toggleDock}
            sizer={
              <>
                <span>Dock</span>
                <span>Undock</span>
              </>
            }
          >
            {docked ? 'Undock' : 'Dock'}
          </PushButton>
        </div>
        <div className="site-row-controls">
          <span className="chrome-emboss site-row-controls-label">Side</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {SIDES.map((s) => (
              <PushButton key={s.key} selected={side === s.key} onClick={() => setSide(s.key)}>
                {s.label}
              </PushButton>
            ))}
          </div>
        </div>
      </Panel>
      {docked && (
        <SidePanel open={open} onToggle={() => setOpen((o) => !o)} side={side} width={280}>
          <Display raised={false}>
            <ScreenRows rows={SETTINGS} />
          </Display>
        </SidePanel>
      )}
    </>
  )
}
