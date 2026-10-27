import { useState } from 'react'
import { Panel, PushButton } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_COLUMN } from '../components/layout'

export function PushButtonSection() {
  return (
    <DemoRow
      id="pushbutton"
      name="PushButton"
      description="A three-layer pushable button mounted on a Panel. Press, select, and disabled states all read at a glance through the brightness ladder."
      demo={<PushButtonDemo />}
    />
  )
}

type RadioKey = 'low' | 'mid' | 'high'
const RADIO_OPTIONS: ReadonlyArray<{ key: RadioKey; label: string }> = [
  { key: 'low', label: 'Low' },
  { key: 'mid', label: 'Mid' },
  { key: 'high', label: 'High' },
]

function PushButtonDemo() {
  const [toggled, setToggled] = useState(false)
  const [radio, setRadio] = useState<RadioKey>('mid')
  return (
    /* The three rows sit evenly down the panel height. */
    <Panel style={PANEL_COLUMN}>
      <div className="site-row-controls">
        <span className="chrome-emboss site-row-controls-label">Action</span>
        <PushButton>Engage</PushButton>
      </div>
      <div className="site-row-controls">
        <span className="chrome-emboss site-row-controls-label">Toggle</span>
        <PushButton
          selected={toggled}
          onClick={() => setToggled((s) => !s)}
          /* Stack both labels into the sizer so the button is sized
             to fit whichever is longer ("Off"). Without this it
             would resize as the visible label swaps. */
          sizer={
            <>
              <span>On</span>
              <span>Off</span>
            </>
          }
        >
          {toggled ? 'On' : 'Off'}
        </PushButton>
      </div>
      <div className="site-row-controls">
        <span className="chrome-emboss site-row-controls-label">Band</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {RADIO_OPTIONS.map((o) => (
            <PushButton
              key={o.key}
              selected={radio === o.key}
              onClick={() => setRadio(o.key)}
            >
              {o.label}
            </PushButton>
          ))}
        </div>
      </div>
    </Panel>
  )
}
