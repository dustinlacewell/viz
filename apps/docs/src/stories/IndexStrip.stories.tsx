import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { IndexStrip, Panel } from '@ldlework/phosphor'

const meta: Meta<typeof IndexStrip> = {
  title: 'Primitives/IndexStrip',
  component: IndexStrip,
}
export default meta

/**
 * A row of index chips. The lit chip is the active index. Click a chip
 * to select it.
 */
export const Default: StoryObj<typeof IndexStrip> = {
  render: function Render() {
    const [active, setActive] = useState(1)
    return (
      <Panel style={{ padding: 20, width: 320 }}>
        <IndexStrip count={4} active={active} onSelect={setActive} />
      </Panel>
    )
  },
}

const MAX_COUNT = 8

/**
 * `actions` adds chrome tiles to the right of the chips. The host
 * supplies each tile's icon, label and click handler. Click + to add a
 * chip and − to remove one. A tile with `disabled` greys out: − at one
 * chip, + at eight.
 */
export const Actions: StoryObj<typeof IndexStrip> = {
  render: function Render() {
    const [count, setCount] = useState(3)
    const [active, setActive] = useState(0)
    return (
      <Panel style={{ padding: 20, width: 360 }}>
        <IndexStrip
          count={count}
          active={Math.min(active, count - 1)}
          onSelect={setActive}
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
          ]}
        />
      </Panel>
    )
  },
}

/**
 * `formatLabel` writes each chip's label from its index. The default
 * is the index itself: 0, 1, 2. Here the chips read A to D. Click a
 * chip to select it.
 */
export const FormatLabel: StoryObj<typeof IndexStrip> = {
  render: function Render() {
    const [active, setActive] = useState(0)
    return (
      <Panel style={{ padding: 20, width: 320 }}>
        <IndexStrip
          count={4}
          active={active}
          onSelect={setActive}
          formatLabel={(i) => String.fromCharCode(65 + i)}
        />
      </Panel>
    )
  },
}

/** The host's own rule for a muted chip, scoped to this story. */
const MUTED_CSS = `.story-chip-state [data-chip-state='muted'] { opacity: 0.45; }`

/**
 * `chipState` writes a string to each chip's `data-chip-state`
 * attribute. Phosphor ships no CSS for it: the host supplies the rule.
 * This story's rule dims a chip whose state is `muted`. Click a chip,
 * then click the M tile to mute or unmute it.
 */
export const ChipState: StoryObj<typeof IndexStrip> = {
  render: function Render() {
    const [active, setActive] = useState(0)
    const [muted, setMuted] = useState<ReadonlySet<number>>(() => new Set([2]))
    const toggleMute = () =>
      setMuted((prev) => {
        const next = new Set(prev)
        if (next.has(active)) next.delete(active)
        else next.add(active)
        return next
      })
    return (
      <Panel style={{ padding: 20, width: 320 }}>
        <style>{MUTED_CSS}</style>
        <IndexStrip
          className="story-chip-state"
          count={4}
          active={active}
          onSelect={setActive}
          chipState={(i) => (muted.has(i) ? 'muted' : undefined)}
          actions={[{ icon: 'M', label: 'mute', onClick: toggleMute }]}
        />
      </Panel>
    )
  },
}
