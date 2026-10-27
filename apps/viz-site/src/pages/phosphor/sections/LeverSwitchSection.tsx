import { useState } from 'react'
import { LeverSwitch, Panel } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'

export function LeverSwitchSection() {
  return (
    <DemoRow
      id="leverswitch"
      name="LeverSwitch"
      description="A two-position rocker with a 3D tilt, mounted on a Panel like every chassis control. One side glows; the other tilts back into the panel."
      demo={<LeverSwitchDemo />}
    />
  )
}

function LeverSwitchDemo() {
  const [pos, setPos] = useState<'left' | 'right'>('left')
  return (
    <Panel
      style={{
        padding: 20,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LeverSwitch left="AUTO" right="MAN" position={pos} onChange={setPos} />
    </Panel>
  )
}
