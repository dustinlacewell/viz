import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Tabs, Panel, type TabItem } from '@ldlework/phosphor'

/**
 * A row of PushButtons where one is selected. The selected tab stays
 * down with a lit label. The host shows the content for that tab.
 */
const meta: Meta<typeof Tabs> = {
  title: 'Primitives/Tabs',
  component: Tabs,
}
export default meta

const PAGES: TabItem[] = [
  { key: 'osc', label: 'Osc' },
  { key: 'filter', label: 'Filter' },
  { key: 'amp', label: 'Amp' },
]

/**
 * The base tab row. Click a tab to select it. It goes down, and the
 * tab that was selected comes back up.
 */
export const Default: StoryObj<typeof Tabs> = {
  render: function Render() {
    const [active, setActive] = useState('filter')
    return (
      <Panel style={{ padding: 20 }}>
        <Tabs tabs={PAGES} active={active} onSelect={setActive} />
      </Panel>
    )
  },
}

/**
 * `disabled` on a tab item dims that tab and blocks it. Click Osc or
 * Filter to select them. Click Amp. It stays up and is not selected.
 */
export const DisabledTab: StoryObj<typeof Tabs> = {
  render: function Render() {
    const [active, setActive] = useState('osc')
    const tabs = PAGES.map((tab) => (tab.key === 'amp' ? { ...tab, disabled: true } : tab))
    return (
      <Panel style={{ padding: 20 }}>
        <Tabs tabs={tabs} active={active} onSelect={setActive} />
      </Panel>
    )
  },
}
