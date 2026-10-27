import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Display, ScrubChipRow } from '@ldlework/phosphor'

const meta: Meta<typeof ScrubChipRow> = {
  title: 'Primitives/ScrubChipRow',
  component: ScrubChipRow,
}
export default meta

type Note = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
const NOTES: ReadonlyArray<Note> = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

/** A note row that holds its own pick. */
function NoteRow(props: { edgeBehavior?: 'wrap' | 'clamp' | 'none'; disabled?: boolean }) {
  const [picked, setPicked] = useState<Note>('C')
  return (
    <ScrubChipRow<Note>
      {...props}
      items={NOTES.map((n) => ({ key: n, lit: n === picked, content: n }))}
      onSelect={setPicked}
    />
  )
}

/**
 * The lit chip is the pick. Click a chip to pick it. Or press a chip
 * and drag left or right: the pick follows the pointer. The pointer
 * can leave the row up or down and the drag goes on.
 */
export const Default: StoryObj<typeof ScrubChipRow> = {
  render: () => (
    <Display>
      <NoteRow />
    </Display>
  ),
}

const EDGES = ['wrap', 'clamp', 'none'] as const

/**
 * `edgeBehavior` sets what a drag does past the end of the row. `wrap`
 * (the default) comes back in from the other end. `clamp` holds the end
 * chip. `none` stops until the pointer is over the row again. In each
 * row, press a chip and drag past the left or right end.
 */
export const EdgeBehavior: StoryObj<typeof ScrubChipRow> = {
  render: () => (
    <Display>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {EDGES.map((edge) => (
          <div key={edge} className="screen-row">
            <span className="screen-row-label">{edge}</span>
            <NoteRow edgeBehavior={edge} />
          </div>
        ))}
      </div>
    </Display>
  ),
}

/**
 * `disabled` dims the chips and ignores the pointer. Click or drag: the
 * pick stays on C.
 */
export const Disabled: StoryObj<typeof ScrubChipRow> = {
  render: () => (
    <Display>
      <NoteRow disabled />
    </Display>
  ),
}
