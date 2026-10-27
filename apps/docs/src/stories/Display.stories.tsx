import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ChipToggle, Display, SegmentedDisplay } from '@ldlework/phosphor'

const meta: Meta<typeof Display> = {
  title: 'Primitives/Display',
  component: Display,
}
export default meta

export const Default: StoryObj<typeof Display> = {
  render: () => (
    <Display padding={16}>
      <div className="screen-chip-row">
        <span className="screen-chip" data-lit="true">ON AIR</span>
        <span className="screen-chip" data-lit="false">CUE</span>
        <span className="screen-chip" data-lit="alt">SOLO</span>
      </div>
    </Display>
  ),
}

/**
 * `cursor` hides the system pointer over the glass and draws a lit
 * one in its place. Clicks still reach the chips.
 */
export const WithCursor: StoryObj<typeof Display> = {
  render: function Render() {
    const [lit, setLit] = useState([true, false, false])
    const toggle = (i: number) => setLit((prev) => prev.map((v, j) => (j === i ? !v : v)))
    return (
      <Display padding={16} cursor>
        <div className="screen-chip-row" style={{ minHeight: 120 }}>
          {['A', 'B', 'C'].map((label, i) => (
            <ChipToggle key={label} value={lit[i] ?? false} onChange={() => toggle(i)}>
              {label}
            </ChipToggle>
          ))}
        </div>
      </Display>
    )
  },
}

export const WithHeaderAndFooter: StoryObj<typeof Display> = {
  render: () => (
    <Display
      padding={16}
      header={
        <>
          <SegmentedDisplay>00:42</SegmentedDisplay>
          <SegmentedDisplay>−06.4</SegmentedDisplay>
        </>
      }
      footer={
        <span className="chrome-emboss" style={{ fontSize: 11, letterSpacing: '0.2em' }}>
          PHOSPHOR · MK II
        </span>
      }
    >
      <div className="screen-chip-row">
        <span className="screen-chip" data-lit="true">A</span>
        <span className="screen-chip" data-lit="false">B</span>
        <span className="screen-chip" data-lit="false">C</span>
      </div>
    </Display>
  ),
}

export const WithReadout: StoryObj<typeof Display> = {
  render: () => (
    <Display readout={<span className="screen-readout">H 248°</span>}>
      <div style={{ minHeight: 120 }} />
    </Display>
  ),
}
