import { useState } from 'react'
import { KeyBank, Panel, PushButton } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_COLUMN } from '../components/layout'

export function KeyBankSection() {
  return (
    <DemoRow
      id="keybank"
      name="KeyBank"
      description="A row of PushButtons joined into one block, like the mode keys on a tape deck. Each key still goes down on its own."
      demo={<KeyBankDemo />}
    />
  )
}

const TAPE_MODES = ['Normal', 'Chrome', 'Metal'] as const

function KeyBankDemo() {
  const [mode, setMode] = useState<string>('Chrome')
  return (
    <Panel style={PANEL_COLUMN}>
      <div className="site-row-controls">
        <span className="chrome-emboss site-row-controls-label">Action</span>
        <KeyBank aria-label="Transport">
          <PushButton>Rew</PushButton>
          <PushButton>Play</PushButton>
          <PushButton>FF</PushButton>
        </KeyBank>
      </div>
      <div className="site-row-controls">
        <span className="chrome-emboss site-row-controls-label">Tape</span>
        <KeyBank aria-label="Tape">
          {TAPE_MODES.map((m) => (
            <PushButton key={m} selected={mode === m} onClick={() => setMode(m)}>
              {m}
            </PushButton>
          ))}
        </KeyBank>
      </div>
    </Panel>
  )
}
