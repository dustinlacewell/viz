import type { Meta, StoryObj } from '@storybook/react'
import { useState, type ReactNode } from 'react'
import { Slider, Panel } from '@ldlework/phosphor'

/**
 * A chrome thumb in a recessed groove. It has no readout of its own.
 * Each story writes the value above the slider so you can see it.
 */
const meta: Meta<typeof Slider> = {
  title: 'Primitives/Slider',
  component: Slider,
}
export default meta

/**
 * The base slider. Drag the thumb, or click the groove to jump there.
 * Click the thumb, then use the arrow keys to nudge it.
 */
export const Default: StoryObj<typeof Slider> = {
  render: function Render() {
    const [v, setV] = useState(0.5)
    return (
      <Panel style={PANEL}>
        <Captioned label="level" readout={v.toFixed(2)}>
          <Slider value={v} min={0} max={1} onChange={setV} />
        </Captioned>
      </Panel>
    )
  },
}

/**
 * `step` snaps the value to whole steps, here one semitone. Drag the
 * thumb. It moves in clicks. Click the thumb, then press the arrow
 * keys. Each press moves one step.
 */
export const Step: StoryObj<typeof Slider> = {
  render: function Render() {
    const [v, setV] = useState(0)
    return (
      <Panel style={PANEL}>
        <Captioned label="transpose" readout={v > 0 ? `+${v}` : `${v}`}>
          <Slider value={v} min={-12} max={12} step={1} onChange={setV} />
        </Captioned>
      </Panel>
    )
  },
}

/**
 * `scale="log"` makes the drag logarithmic. Each equal move multiplies
 * the value by the same amount, so the low end is as easy to set as
 * the high end. Drag the thumb to the middle. It reads about 390 Hz,
 * not 1525 Hz. The range must start above 0.
 */
export const LogScale: StoryObj<typeof Slider> = {
  render: function Render() {
    const [v, setV] = useState(600)
    return (
      <Panel style={PANEL}>
        <Captioned label="freq" readout={`${Math.round(v)} Hz`}>
          <Slider value={v} min={50} max={3000} scale="log" onChange={setV} />
        </Captioned>
      </Panel>
    )
  },
}

/**
 * `disabled` dims the slider and blocks it. Try to drag the thumb. It
 * does not move.
 */
export const Disabled: StoryObj<typeof Slider> = {
  render: () => (
    <Panel style={PANEL}>
      <Captioned label="level" readout="0.30">
        <Slider value={0.3} min={0} max={1} onChange={() => {}} disabled />
      </Captioned>
    </Panel>
  ),
}

const PANEL = { padding: 20, width: 280 } as const

/** A label and a readout above the slider. */
function Captioned({ label, readout, children }: { label: string; readout: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="chrome-emboss" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span>{label}</span>
        <span>{readout}</span>
      </div>
      {children}
    </div>
  )
}
