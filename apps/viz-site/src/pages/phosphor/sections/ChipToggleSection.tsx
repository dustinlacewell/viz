import { useState } from 'react'
import { ChipToggle, Display } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { HUG_CELL } from '../components/layout'

export function ChipToggleSection() {
  return (
    <DemoRow
      id="chiptoggle"
      name="ChipToggle"
      description="One on-glass chip with lit / unlit states. Pass both labels to lock the chip's width so toggling never resizes the box."
      demo={<ChipToggleDemo />}
    />
  )
}

function ChipToggleDemo() {
  const [on, setOn] = useState(true)
  return (
    <Display style={HUG_CELL}>
      <div className="screen-chip-row">
        <ChipToggle value={on} onChange={setOn} onLabel="ON" offLabel="OFF" />
        <ChipToggle
          value={!on}
          onChange={(v) => setOn(!v)}
          onLabel="STANDBY"
          offLabel="LIVE"
        />
      </div>
    </Display>
  )
}
