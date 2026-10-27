import type { Meta, StoryObj } from '@storybook/react'
import type { ReactNode } from 'react'
import { Panel, SegmentedSurface } from '@ldlework/phosphor'

/**
 * The bare two-layer glass that `SegmentedDisplay` is built on. Its
 * `lit` and `ghost` slots take any React node, not only text in the
 * segment font. For text, and for `color` and `ghostOffset`, see
 * SegmentedDisplay.
 */
const meta: Meta<typeof SegmentedSurface> = {
  title: 'Primitives/SegmentedSurface',
  component: SegmentedSurface,
}
export default meta

/** A small mono tag beside segment digits, baseline-aligned. */
function TaggedReading({ tag, digits, tagHidden }: { tag: string; digits: ReactNode; tagHidden?: boolean }) {
  return (
    <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 12,
          visibility: tagHidden ? 'hidden' : 'visible',
        }}
      >
        {tag}
      </span>
      <span>{digits}</span>
    </span>
  )
}

/**
 * `lit` takes markup. Here it mixes a mono REC tag with segment
 * digits. Look at the two fonts on one glass.
 */
export const MixedContent: StoryObj<typeof SegmentedSurface> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <SegmentedSurface lit={<TaggedReading tag="REC" digits="03:14" />} />
    </Panel>
  ),
}

/**
 * `ghost` takes markup too. It draws in the dim color behind `lit`.
 * Here the ghost holds the REC tag and the lit layer leaves it out, so
 * REC shows unlit: the tag is off. Look at REC beside the lit digits.
 */
export const Ghost: StoryObj<typeof SegmentedSurface> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <SegmentedSurface
        lit={<TaggedReading tag="REC" digits="03:14" tagHidden />}
        ghost={<TaggedReading tag="REC" digits="88:88" />}
      />
    </Panel>
  ),
}
