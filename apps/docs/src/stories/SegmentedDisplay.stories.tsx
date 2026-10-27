import type { Meta, StoryObj } from '@storybook/react'
import { Panel, SegmentedDisplay } from '@ldlework/phosphor'

const meta: Meta<typeof SegmentedDisplay> = {
  title: 'Primitives/SegmentedDisplay',
  component: SegmentedDisplay,
}
export default meta

/**
 * Digits in a seven-segment font on a small recessed glass. It sits
 * straight on a Panel. Without `color` it takes the theme hue.
 */
export const Default: StoryObj<typeof SegmentedDisplay> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <SegmentedDisplay>03:14</SegmentedDisplay>
    </Panel>
  ),
}

const LOCKED_GREEN = 'oklch(0.85 0.18 145)'

/**
 * `color` locks the emitted color: the digits, the glow and the rim.
 * Left: no `color`, so it follows the theme hue. Right: locked green,
 * so it stays green when the theme changes.
 */
export const Color: StoryObj<typeof SegmentedDisplay> = {
  render: () => (
    <Panel style={{ padding: 20, display: 'flex', gap: 24 }}>
      {[undefined, LOCKED_GREEN].map((color) => (
        <div key={color ?? 'theme'} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="chrome-emboss" style={{ fontSize: 11 }}>
            {color ? 'color green' : 'theme'}
          </span>
          <SegmentedDisplay color={color}>03:14</SegmentedDisplay>
        </div>
      ))}
    </Panel>
  ),
}

/**
 * `ghost` draws dim text behind the digits: the unlit segments. Give
 * it the same number of characters as the digits. Look at the 0, 3, 1
 * and 4: their unlit segments show faintly.
 */
export const Ghost: StoryObj<typeof SegmentedDisplay> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <SegmentedDisplay ghost="88:88">03:14</SegmentedDisplay>
    </Panel>
  ),
}

/**
 * `ghostOffset` moves the ghost layer by a few pixels, so it reads as
 * a shadow behind the digits. Here it moves 2 px right and 2 px down.
 */
export const GhostOffset: StoryObj<typeof SegmentedDisplay> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <SegmentedDisplay ghost="88:88" ghostOffset={{ x: 2, y: 2 }}>
        03:14
      </SegmentedDisplay>
    </Panel>
  ),
}
