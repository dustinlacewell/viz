import { useState } from 'react'
import { Display, ScrubChipRow } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { HUG_CELL } from '../components/layout'

export function ScrubChipRowSection() {
  return (
    <DemoRow
      id="scrubchiprow"
      name="ScrubChipRow"
      description="A horizontal row of OLED chips with drag-to-scrub selection. Press and slide to sweep through values; the row tracks the pointer globally."
      demo={<ScrubChipDemo />}
    />
  )
}

type Note = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
const NOTES: ReadonlyArray<Note> = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

function ScrubChipDemo() {
  const [picked, setPicked] = useState<Note>('C')
  return (
    <Display style={HUG_CELL}>
      <ScrubChipRow<Note>
        items={NOTES.map((n) => ({ key: n, lit: n === picked, content: n }))}
        onSelect={(k) => setPicked(k)}
      />
    </Display>
  )
}
