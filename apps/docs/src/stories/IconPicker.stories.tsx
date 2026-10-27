import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { IconPicker, Knob, Panel, type IconPickerOption } from '@ldlework/phosphor'
import { noneIcon, sourceIcon } from '@ldlework/phosphor-dials'

/**
 * A small chrome key that shows the current option's glyph. Click it to
 * open a grid of glyphs. For options told apart by shape, not by name.
 */
const meta: Meta<typeof IconPicker> = {
  title: 'Primitives/IconPicker',
  component: IconPicker,
  // The popover hangs below the trigger, outside the Panel. Reserve
  // that room in the canvas, not as lopsided Panel padding.
  decorators: [
    (Story) => (
      <div style={{ paddingBottom: 160 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

/** Every dials stdlib source name, in registration order. */
const SOURCE_NAMES = [
  'sine', 'tri', 'saw', 'square',
  'whiteNoise', 'valueNoise', 'perlin1D', 'fbm', 'brown',
  'smooth',
  'add', 'mul', 'lerp',
  'gate', 'phaseGate',
]

const NONE: IconPickerOption = { value: '', label: 'none', icon: noneIcon }

const SOURCES: IconPickerOption[] = [
  NONE,
  ...SOURCE_NAMES.map((name) => ({ value: name, label: name, icon: sourceIcon(name) })),
]

/** The four periodic waves, each with one line on its shape. */
const WAVES: [string, string][] = [
  ['sine', 'Smooth, even swing.'],
  ['tri', 'Straight ramps up and down.'],
  ['saw', 'Ramps up, then drops.'],
  ['square', 'Jumps between high and low.'],
]

function waveOption([name]: [string, string]): IconPickerOption {
  return { value: name, label: name, icon: sourceIcon(name) }
}

/**
 * `options` fills the grid, here with every modulation source glyph.
 * Click the key to open the grid. Click a glyph to pick it; the key
 * shows it and the grid closes. Press Escape or click outside to close
 * the grid with no change.
 */
export const Default: StoryObj<typeof IconPicker> = {
  render: function Render() {
    const [value, setValue] = useState('sine')
    return (
      <Panel style={{ padding: 20 }}>
        <IconPicker value={value} options={SOURCES} onChange={setValue} label="Modulation source" />
      </Panel>
    )
  },
}

/**
 * `option.hint` adds a line to the cell's native tooltip, after the
 * label. Open the grid and rest the pointer on a glyph to read it.
 */
export const Hint: StoryObj<typeof IconPicker> = {
  render: function Render() {
    const [value, setValue] = useState('sine')
    const options = [NONE, ...WAVES.map((w) => ({ ...waveOption(w), hint: w[1] }))]
    return (
      <Panel style={{ padding: 20 }}>
        <IconPicker value={value} options={options} onChange={setValue} label="Modulation source" />
      </Panel>
    )
  },
}

/**
 * `hoverContent` puts a card on the closed key that says what the
 * picker sets. Hover the key to see it. Click the key: the card goes
 * away while the grid is open.
 */
export const HoverContent: StoryObj<typeof IconPicker> = {
  render: function Render() {
    const [value, setValue] = useState('sine')
    return (
      <Panel style={{ padding: 20 }}>
        <IconPicker
          value={value}
          options={[NONE, ...WAVES.map(waveOption)]}
          onChange={setValue}
          label="Modulation source"
          hoverContent={
            <>
              <strong>Modulation source</strong>
              <span>The wave that moves this control.</span>
            </>
          }
        />
      </Panel>
    )
  },
}

/**
 * `option.hover` gives a cell a card. The card sits beside the grid, so
 * it never covers a glyph. Open the grid and hover each glyph. The
 * cell's native tooltip is off when it has a card.
 */
export const OptionHover: StoryObj<typeof IconPicker> = {
  render: function Render() {
    const [value, setValue] = useState('sine')
    const options = [
      NONE,
      ...WAVES.map((w) => ({
        ...waveOption(w),
        hover: (
          <>
            <strong>{w[0]}</strong>
            <span>{w[1]}</span>
          </>
        ),
      })),
    ]
    return (
      <Panel style={{ padding: 20 }}>
        <IconPicker value={value} options={options} onChange={setValue} label="Modulation source" />
      </Panel>
    )
  },
}

const POLARITIES = [
  ['uni', '+', 'Unipolar: swings above the value only'],
  ['bi', '±', 'Bipolar: swings above and below the value'],
] as const

/**
 * `footer` adds controls below the grid, here a polarity switch. Open
 * the grid and click + or ±. The grid stays open, so you can set the
 * polarity and then pick a glyph.
 */
export const Footer: StoryObj<typeof IconPicker> = {
  render: function Render() {
    const [value, setValue] = useState('sine')
    const [polarity, setPolarity] = useState<string>('bi')
    return (
      <Panel style={{ padding: 20 }}>
        <IconPicker
          value={value}
          options={[NONE, ...WAVES.map(waveOption)]}
          onChange={setValue}
          label="Modulation source"
          footer={
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              {POLARITIES.map(([key, glyph, title]) => (
                <button
                  key={key}
                  type="button"
                  title={title}
                  className={`chrome-iconpicker-cell ${key === polarity ? 'is-selected' : ''}`}
                  onClick={() => setPolarity(key)}
                >
                  {glyph}
                </button>
              ))}
            </div>
          }
        />
      </Panel>
    )
  },
}

/**
 * `align` sets where the grid sits against the key. Left: the default
 * `end`, the grid's right edge meets the key's right edge. Right:
 * `center`, the grid is centred under the key. Click each key to
 * compare.
 */
export const Align: StoryObj<typeof IconPicker> = {
  render: function Render() {
    const [value, setValue] = useState('sine')
    return (
      <Panel style={{ padding: 20, display: 'flex', gap: 120 }}>
        {(['end', 'center'] as const).map((align) => (
          <div key={align} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="chrome-emboss" style={{ fontSize: 11 }}>
              {align}
            </span>
            <IconPicker
              value={value}
              options={SOURCES}
              onChange={setValue}
              align={align}
              label={`Modulation source, align ${align}`}
            />
          </div>
        ))}
      </Panel>
    )
  },
}

/**
 * `hideTrigger` drops the key. The host holds `open` and opens the
 * grid from its own control. Here the knob is that control, and
 * `align="center"` hangs the grid under the knob. Right-click the
 * knob to open the grid. Pick a glyph; the caption shows it.
 */
export const HideTrigger: StoryObj<typeof IconPicker> = {
  render: function Render() {
    const [value, setValue] = useState('sine')
    const [open, setOpen] = useState(false)
    const [amp, setAmp] = useState(0.5)
    return (
      <Panel style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Knob
            value={amp}
            baseline={amp}
            range={[0, 1]}
            label="amp"
            onChangeBaseline={setAmp}
            onRightClick={() => setOpen(true)}
          />
          <IconPicker
            value={value}
            options={SOURCES}
            onChange={setValue}
            open={open}
            onOpenChange={setOpen}
            hideTrigger
            align="center"
            label="Modulation source"
            style={{ position: 'absolute', left: '50%', bottom: 0 }}
          />
        </div>
        <div className="chrome-emboss" style={{ fontSize: 12 }}>
          source {value || 'none'} · right-click the knob
        </div>
      </Panel>
    )
  },
}
