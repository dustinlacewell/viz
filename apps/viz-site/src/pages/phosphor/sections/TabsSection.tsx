import { useState } from 'react'
import { Display, Panel, Tabs, type TabItem } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_COLUMN } from '../components/layout'
import { ScreenRows } from '../components/ScreenRows'

export function TabsSection() {
  return (
    <DemoRow
      id="tabs"
      name="Tabs"
      description="A row of PushButtons with one held down. The host shows the page for the selected tab. Arrow keys move between tabs and skip a disabled one."
      demo={<TabsDemo />}
    />
  )
}

/* FX is disabled: this patch has no effects stage. */
const PAGES: TabItem[] = [
  { key: 'osc', label: 'Osc' },
  { key: 'filter', label: 'Filter' },
  { key: 'amp', label: 'Amp' },
  { key: 'fx', label: 'FX', disabled: true },
]

const PAGE_ROWS: Record<string, ReadonlyArray<readonly [string, string]>> = {
  osc: [['wave', 'saw'], ['octave', '+1']],
  filter: [['cutoff', '1.2 kHz'], ['res', '0.40']],
  amp: [['attack', '12 ms'], ['release', '300 ms']],
}

function TabsDemo() {
  const [active, setActive] = useState('filter')
  return (
    <Panel style={PANEL_COLUMN}>
      <Tabs tabs={PAGES} active={active} onSelect={setActive} />
      <Display raised={false}>
        <ScreenRows rows={PAGE_ROWS[active] ?? []} />
      </Display>
    </Panel>
  )
}
