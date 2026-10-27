import { useState } from 'react'
import { Dropdown, Panel, type DropdownOption } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_COLUMN } from '../components/layout'

export function DropdownSection() {
  return (
    <DemoRow
      id="dropdown"
      name="Dropdown"
      description="A native select in a raised chrome pill. The browser draws the open list, so keyboard and touch work as they do everywhere else."
      demo={<DropdownDemo />}
    />
  )
}

const WAVES: DropdownOption[] = [
  { value: 'sine', label: 'Sine' },
  { value: 'tri', label: 'Triangle' },
  { value: 'saw', label: 'Sawtooth' },
  { value: 'square', label: 'Square' },
]

const FILTERS: DropdownOption[] = [
  { value: 'lp', label: 'Low-pass' },
  { value: 'hp', label: 'High-pass' },
  { value: 'bp', label: 'Band-pass' },
]

function DropdownDemo() {
  const [wave, setWave] = useState('saw')
  const [filter, setFilter] = useState('lp')
  return (
    <Panel style={PANEL_COLUMN}>
      <div className="site-row-controls">
        <span className="chrome-emboss site-row-controls-label">Wave</span>
        <Dropdown value={wave} options={WAVES} onChange={setWave} />
      </div>
      <div className="site-row-controls">
        <span className="chrome-emboss site-row-controls-label">Filter</span>
        <Dropdown value={filter} options={FILTERS} onChange={setFilter} />
      </div>
    </Panel>
  )
}
