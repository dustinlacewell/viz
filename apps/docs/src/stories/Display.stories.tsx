import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ChipToggle, Display, Panel, PushButton } from '@ldlework/phosphor'

const meta: Meta<typeof Display> = {
  title: 'Primitives/Display',
  component: Display,
}
export default meta

/** On-glass label / value rows. */
function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="screen-rows">
      {rows.map(([label, value]) => (
        <div key={`${label} ${value}`} className="screen-row">
          <span className="screen-row-label">{label}</span>
          <span className="screen-row-readout">{value}</span>
        </div>
      ))}
    </div>
  )
}

const FLOOR_DB = -30

/**
 * An output meter on the glass: a level bar under a pinned readout.
 * It paints with `--display-color`, so it takes the screen's color.
 */
function Meter({ db }: { db: number }) {
  return (
    <>
      <span className="screen-readout">out {formatDb(db)}</span>
      <div style={{ paddingTop: 32 }}>
        <div
          style={{
            height: 10,
            borderRadius: 2,
            background: 'color-mix(in oklch, var(--display-color) 25%, transparent)',
          }}
        >
          <div
            style={{
              width: `${((db - FLOOR_DB) / -FLOOR_DB) * 100}%`,
              height: '100%',
              borderRadius: 2,
              background: 'var(--display-color)',
              boxShadow: '0 0 8px var(--display-color)',
            }}
          />
        </div>
      </div>
    </>
  )
}

function formatDb(db: number): string {
  return db === 0 ? '0 dB' : `−${Math.abs(db)} dB`
}

/**
 * The defaults: a raised chrome chassis of its own, with the glass in
 * a black bezel ring. Use it when the screen is a device by itself,
 * e.g. the dialog in a Modal.
 */
export const Default: StoryObj<typeof Display> = {
  render: () => (
    <Display>
      <div className="screen-chip-row">
        <span className="screen-chip" data-lit="true">ON AIR</span>
        <span className="screen-chip" data-lit="false">CUE</span>
        <span className="screen-chip" data-lit="alt">SOLO</span>
      </div>
    </Display>
  ),
}

const INPUT_NAMES = ['MIC', 'LINE', 'USB'] as const
type Input = (typeof INPUT_NAMES)[number]
const INPUTS: Record<Input, [string, string][]> = {
  MIC: [['jack', 'XLR 1'], ['gain', '+42 dB'], ['phantom', '48 V']],
  LINE: [['jack', 'TRS 2'], ['gain', '+4 dB'], ['phantom', 'off']],
  USB: [['jack', 'USB 1-2'], ['gain', '0 dB'], ['phantom', 'off']],
}

/**
 * `raised={false}` drops the chassis: the bezel sits straight in the
 * host Panel, beside the keys that drive it. Press MIC, LINE or USB;
 * the glass shows that input's settings.
 */
export const Recessed: StoryObj<typeof Display> = {
  render: function Render() {
    const [input, setInput] = useState<Input>('MIC')
    return (
      <Panel style={{ padding: 20, width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Display raised={false}>
          <Rows rows={INPUTS[input]} />
        </Display>
        <div style={{ display: 'flex', gap: 12 }}>
          {INPUT_NAMES.map((name) => (
            <PushButton key={name} selected={name === input} onClick={() => setInput(name)}>
              {name}
            </PushButton>
          ))}
        </div>
      </Panel>
    )
  },
}

/**
 * `bezel={false}` drops the black ring: the glass meets the chrome
 * through one chamfer. Right for a small readout. Press − and + to
 * step the output level; the readout and the bar follow.
 */
export const NoBezel: StoryObj<typeof Display> = {
  render: function Render() {
    const [db, setDb] = useState(-12)
    const step = (by: number) => setDb((v) => Math.min(0, Math.max(FLOOR_DB, v + by)))
    return (
      <Panel style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Display raised={false} bezel={false} style={{ width: 240 }}>
          <Meter db={db} />
        </Display>
        <PushButton aria-label="Level down" disabled={db === FLOOR_DB} onClick={() => step(-3)}>
          −
        </PushButton>
        <PushButton aria-label="Level up" disabled={db === 0} onClick={() => step(3)}>
          +
        </PushButton>
      </Panel>
    )
  },
}

const LOCKED_GREEN = 'oklch(0.86 0.2 145)'

/**
 * `color` locks the screen's emitted color. It tints the rim, the
 * spill and the drawn cursor, and on-glass content can paint with
 * `var(--display-color)`, as the meter does. Left: no `color`, so it
 * follows the theme hue. Right: locked green, so it stays green when
 * the theme changes. Hover each glass to see its cursor color.
 */
export const Color: StoryObj<typeof Display> = {
  render: () => (
    <Panel style={{ padding: 20, display: 'flex', gap: 24 }}>
      {[undefined, LOCKED_GREEN].map((color) => (
        <div key={color ?? 'theme'} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="chrome-emboss" style={{ fontSize: 11 }}>
            {color ? 'color green' : 'theme'}
          </span>
          <Display color={color} cursor style={{ width: 220 }}>
            <Meter db={-6} />
          </Display>
        </div>
      ))}
    </Panel>
  ),
}

const TRACK: [string, string][] = [
  ['track', '04'],
  ['time', '03:41'],
]

/**
 * `padding` sets the margin between the glass edge and the content.
 * Left: no `padding`, so the glass keeps the standard margin. Right:
 * `padding={0}`, so the content meets the edge. Use 0 for a canvas
 * that fills the glass.
 */
export const Padding: StoryObj<typeof Display> = {
  render: () => (
    <Panel style={{ padding: 20, display: 'flex', gap: 24 }}>
      {[undefined, 0].map((padding) => (
        <div key={padding ?? 'default'} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="chrome-emboss" style={{ fontSize: 11 }}>
            {padding === undefined ? 'default' : `padding ${padding}`}
          </span>
          <Display padding={padding}>
            <Rows rows={TRACK} />
          </Display>
        </div>
      ))}
    </Panel>
  ),
}

/**
 * `fill` stretches the Display and its glass to the parent's height.
 * The parent here is a fixed-height column; the glass reaches its
 * bottom edge.
 */
export const Fill: StoryObj<typeof Display> = {
  render: () => (
    <Panel style={{ padding: 20, width: 320, height: 260, display: 'flex', flexDirection: 'column' }}>
      <Display fill>
        <Rows rows={TRACK} />
      </Display>
    </Panel>
  ),
}

/**
 * `cursor` hides the system pointer over the glass and draws a lit
 * one in its place. Move the mouse over the glass to see it. Click
 * the chips: clicks still reach them.
 */
export const WithCursor: StoryObj<typeof Display> = {
  render: function Render() {
    const [lit, setLit] = useState([true, false, false])
    const toggle = (i: number) => setLit((prev) => prev.map((v, j) => (j === i ? !v : v)))
    return (
      <Display cursor>
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
