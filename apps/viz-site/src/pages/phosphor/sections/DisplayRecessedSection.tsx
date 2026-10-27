import { useState } from 'react'
import { Display, Panel, PushButton } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_COLUMN } from '../components/layout'
import { LevelMeter } from '../components/LevelMeter'
import { ScreenRows } from '../components/ScreenRows'

export function DisplayRecessedSection() {
  return (
    <DemoRow
      id="display-recessed"
      name="Display · set into a panel"
      description="Turn raised off and the screen sits in a host Panel, beside the keys that drive it. Turn bezel off too and the glass meets the chrome through one chamfer, which suits a small meter."
      demo={<DisplayRecessedDemo />}
    />
  )
}

const INPUT_NAMES = ['MIC', 'LINE', 'USB'] as const
type Input = (typeof INPUT_NAMES)[number]

interface InputSettings {
  rows: ReadonlyArray<readonly [string, string]>
  level: number
}

const INPUTS: Record<Input, InputSettings> = {
  MIC: { rows: [['jack', 'XLR 1'], ['gain', '+42 dB'], ['phantom', '48 V']], level: -18 },
  LINE: { rows: [['jack', 'TRS 2'], ['gain', '+4 dB'], ['phantom', 'off']], level: -6 },
  USB: { rows: [['jack', 'USB 1-2'], ['gain', '0 dB'], ['phantom', 'off']], level: -12 },
}

function DisplayRecessedDemo() {
  const [input, setInput] = useState<Input>('MIC')
  const settings = INPUTS[input]
  return (
    <Panel style={PANEL_COLUMN}>
      <Display raised={false}>
        <ScreenRows rows={settings.rows} />
      </Display>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {INPUT_NAMES.map((name) => (
          <PushButton key={name} selected={name === input} onClick={() => setInput(name)}>
            {name}
          </PushButton>
        ))}
        <Display raised={false} bezel={false} style={{ flex: 1, minWidth: 0 }}>
          <LevelMeter db={settings.level} />
        </Display>
      </div>
    </Panel>
  )
}
