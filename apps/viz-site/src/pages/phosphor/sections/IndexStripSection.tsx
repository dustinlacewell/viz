import { useState } from 'react'
import { IndexStrip, Panel } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_CELL } from '../components/layout'

export function IndexStripSection() {
  return (
    <DemoRow
      id="indexstrip"
      name="IndexStrip"
      description="A row of index chips with chrome action tiles beside them. The lit chip is the active one. Here + and − add and remove chips, and M mutes the active chip."
      demo={<IndexStripDemo />}
    />
  )
}

const MAX_COUNT = 8

function IndexStripDemo() {
  const [count, setCount] = useState(4)
  const [active, setActive] = useState(0)
  const [muted, setMuted] = useState<ReadonlySet<number>>(() => new Set([2]))
  const current = Math.min(active, count - 1)
  const toggleMute = () =>
    setMuted((prev) => {
      const next = new Set(prev)
      if (next.has(current)) next.delete(current)
      else next.add(current)
      return next
    })
  return (
    <Panel
      style={{
        ...PANEL_CELL,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Phosphor ships no CSS for chip state; site.css dims `muted`. */}
      <IndexStrip
        className="site-indexstrip"
        count={count}
        active={current}
        onSelect={setActive}
        chipState={(i) => (muted.has(i) ? 'muted' : undefined)}
        actions={[
          {
            icon: '+',
            label: 'add',
            onClick: () => setCount((c) => c + 1),
            disabled: count >= MAX_COUNT,
          },
          {
            icon: '−',
            label: 'remove',
            onClick: () => setCount((c) => c - 1),
            disabled: count <= 1,
          },
          { icon: 'M', label: 'mute', onClick: toggleMute },
        ]}
      />
    </Panel>
  )
}
