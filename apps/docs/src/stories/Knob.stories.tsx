import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Knob, Panel, type KnobProps } from '@ldlework/phosphor'

const meta: Meta<typeof Knob> = {
  title: 'Primitives/Knob',
  component: Knob,
}
export default meta

/** Panel layout for a knob with one control or caption below it. */
const STACK = {
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
} as const

/**
 * The base dial. The lit arc runs from the start to the value.
 * Drag up or down to change the value. Hold Shift for fine moves.
 * Scroll to nudge it. Click the knob, then use the arrow keys.
 * Double-click or press Home to reset it.
 */
export const Default: StoryObj<typeof Knob> = {
  render: () => {
    const [v, setV] = useState(0.5)
    return (
      <Panel style={{ padding: 20 }}>
        <Knob
          value={v}
          baseline={v}
          range={[0, 1]}
          defaultValue={0.5}
          label="amp"
          onChangeBaseline={setV}
        />
      </Panel>
    )
  },
}

/**
 * `scale="log"` makes the drag logarithmic. Drag up or down. Each equal
 * drag multiplies the value by the same amount, so the low end is as
 * easy to set as the high end. The range must start above 0.
 */
export const LogScale: StoryObj<typeof Knob> = {
  render: () => {
    const [v, setV] = useState(600)
    return (
      <Panel style={{ padding: 20 }}>
        <Knob
          value={v}
          baseline={v}
          range={[50, 3000]}
          scale="log"
          defaultValue={600}
          label="freq"
          unit="hz"
          onChangeBaseline={setV}
        />
      </Panel>
    )
  },
}

/**
 * `step` snaps the value to whole steps. Drag, scroll, or press the
 * arrow keys. Each scroll click or key press moves one step. `format`
 * writes the readout, here with a + sign.
 */
export const Stepped: StoryObj<typeof Knob> = {
  render: () => {
    const [v, setV] = useState(0)
    return (
      <Panel style={{ padding: 20 }}>
        <Knob
          value={v}
          baseline={v}
          range={[-12, 12]}
          step={1}
          defaultValue={0}
          label="transpose"
          format={(x) => (x > 0 ? `+${x}` : `${x}`)}
          onChangeBaseline={setV}
        />
      </Panel>
    )
  },
}

/**
 * The Knob does not smooth its value. `glide` (0 to 1) only draws the
 * host's glide setting as a bar in the gap at the bottom of the arc.
 * SHIFT + right-drag up or down to change the bar. A plain drag still
 * sets the value at once, with no smoothing.
 */
export const Glide: StoryObj<typeof Knob> = {
  render: () => {
    const [v, setV] = useState(0.5)
    const [glide, setGlide] = useState(0.6)
    return (
      <Panel style={STACK}>
        <Knob
          value={v}
          baseline={v}
          range={[0, 1]}
          glide={glide}
          onChangeGlide={setGlide}
          defaultValue={0.5}
          label="amp"
          onChangeBaseline={setV}
        />
        <div className="chrome-emboss" style={{ fontSize: 12 }}>
          glide bar {glide.toFixed(2)} · shift + right-drag
        </div>
      </Panel>
    )
  },
}

/** Panel layout for knobs side by side, bottoms aligned. */
const ROW = {
  padding: 20,
  display: 'flex',
  alignItems: 'flex-end',
  gap: 24,
} as const

/**
 * A knob that holds its own baseline, for stories where the baseline
 * is not the feature on show.
 */
function HeldKnob({
  initial,
  ...props
}: Omit<KnobProps, 'value' | 'baseline' | 'onChangeBaseline'> & { initial: number }) {
  const [v, setV] = useState(initial)
  return <Knob {...props} value={v} baseline={v} onChangeBaseline={setV} />
}

/**
 * `depth` draws a white band around the value: the range a modulator
 * swings it through. Right-drag up or down to widen or narrow the band.
 * Hold Shift for fine moves. Left-drag moves the value and the band
 * with it. Nothing modulates the value here, so it stays still.
 */
export const Depth: StoryObj<typeof Knob> = {
  render: function Render() {
    const [pan, setPan] = useState(0)
    const [depth, setDepth] = useState(0.3)
    return (
      <Panel style={{ padding: 20 }}>
        <Knob
          value={pan}
          baseline={pan}
          range={[-1, 1]}
          depth={depth}
          onChangeDepth={setDepth}
          defaultValue={0}
          label="pan"
          onChangeBaseline={setPan}
        />
      </Panel>
    )
  },
}

/**
 * `mode` sets which way the depth band extends from the value: `center`
 * both ways, `up` above only, `down` below only. The Knob has no gesture
 * for mode. The host sets it as a prop. Compare the three bands. Drag a
 * knob up or down to move its band.
 */
export const Mode: StoryObj<typeof Knob> = {
  render: () => (
    <Panel style={ROW}>
      <HeldKnob initial={0.5} range={[0, 1]} depth={0.25} mode="center" label="pitch" />
      <HeldKnob initial={0.3} range={[0, 1]} depth={0.25} mode="up" label="cutoff" />
      <HeldKnob initial={0.8} range={[0, 1]} depth={0.25} mode="down" label="level" />
    </Panel>
  ),
}

/**
 * `size` sets the dial diameter in px. The default is 72. Drag either
 * knob up or down. Both work the same.
 */
export const Size: StoryObj<typeof Knob> = {
  render: () => (
    <Panel style={ROW}>
      <HeldKnob initial={0.5} range={[0, 1]} size={44} label="trim" />
      <HeldKnob initial={0.7} range={[0, 1]} size={96} label="volume" />
    </Panel>
  ),
}
