import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ChipToggle, Display } from '@ldlework/phosphor'
import { CrtScreen } from '@ldlework/phosphor-crt'
import { PHOSPHOR_P31, PHOSPHOR_P7 } from '@ldlework/crt'

const meta: Meta<typeof CrtScreen> = {
  title: 'phosphor-crt/CrtScreen',
  component: CrtScreen,
}
export default meta

function Chips() {
  const [lit, setLit] = useState([true, false, false])
  const toggle = (i: number) => setLit((prev) => prev.map((v, j) => (j === i ? !v : v)))
  return (
    <div className="screen-chip-row" style={{ minHeight: 200 }}>
      {['A', 'B', 'C'].map((label, i) => (
        <ChipToggle key={label} value={lit[i] ?? false} onChange={() => toggle(i)}>
          {label}
        </ChipToggle>
      ))}
    </div>
  )
}

/**
 * The cursor is drawn into the phosphor: it glows and trails. The
 * chips are plain HTML on top, so the cursor passes under them.
 */
export const WithCursor: StoryObj<typeof CrtScreen> = {
  render: () => (
    <Display cursor style={{ width: 420 }}>
      <CrtScreen {...PHOSPHOR_P31} />
      <Chips />
    </Display>
  ),
}

/** A long-persistence phosphor: the trail lingers for seconds. */
export const LongTrail: StoryObj<typeof CrtScreen> = {
  render: () => (
    <Display cursor style={{ width: 420 }}>
      <CrtScreen {...PHOSPHOR_P7} />
      <Chips />
    </Display>
  ),
}
