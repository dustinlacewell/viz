import { useState } from 'react'
import { IconPicker, Panel, type IconPickerOption } from '@ldlework/phosphor'
import { noneIcon, sourceIcon } from '@ldlework/phosphor-dials'
import { DemoRow } from '../components/DemoRow'
import { PANEL_CELL } from '../components/layout'

export function IconPickerSection() {
  return (
    <DemoRow
      id="iconpicker"
      name="IconPicker"
      description="A small chrome key that shows the current option's glyph. Click it to open a grid of glyphs; hover a glyph for its card. Use it for options told apart by shape, not by name."
      demo={<IconPickerDemo />}
    />
  )
}

/** The four periodic waves, each with one line on its shape. */
const WAVES: ReadonlyArray<readonly [string, string]> = [
  ['sine', 'Smooth, even swing.'],
  ['tri', 'Straight ramps up and down.'],
  ['saw', 'Ramps up, then drops.'],
  ['square', 'Jumps between high and low.'],
]

const NONE: IconPickerOption = { value: '', label: 'none', icon: noneIcon }

const OPTIONS: IconPickerOption[] = [
  NONE,
  ...WAVES.map(([name, line]) => ({
    value: name,
    label: name,
    icon: sourceIcon(name),
    hover: (
      <>
        <strong>{name}</strong>
        <span>{line}</span>
      </>
    ),
  })),
]

const POLARITIES = [
  ['uni', '+', 'Unipolar: swings above the value only'],
  ['bi', '±', 'Bipolar: swings above and below the value'],
] as const
type Polarity = (typeof POLARITIES)[number][0]

function IconPickerDemo() {
  const [source, setSource] = useState('sine')
  const [polarity, setPolarity] = useState<Polarity>('bi')
  return (
    <Panel
      style={{
        ...PANEL_CELL,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="site-row-controls">
        <span className="chrome-emboss site-row-controls-label">Source</span>
        <IconPicker
          value={source}
          options={OPTIONS}
          onChange={setSource}
          align="center"
          label="Modulation source"
          hoverContent={
            <>
              <strong>Modulation source</strong>
              <span>The wave that moves this control.</span>
            </>
          }
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
      </div>
    </Panel>
  )
}
