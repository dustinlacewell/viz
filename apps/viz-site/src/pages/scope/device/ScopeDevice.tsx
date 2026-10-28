import { useRef, useState, type CSSProperties } from 'react'
import { Display, Knob, Panel, Tabs } from '@ldlework/phosphor'
import { CrtSurface } from '@ldlework/crt/react'
import { Graticule } from './Graticule'
import { formatFraction, formatHz, formatLevel, formatShape, formatTimePerDiv } from './readouts'
import {
  AMP_RANGE,
  DEFAULT_CONTROLS,
  DIVISIONS_X,
  DIVISIONS_Y,
  FREQ_RANGE,
  INTENSITY_RANGE,
  PERSISTENCE_RANGE,
  TIME_PER_DIV_RANGE,
  TRIGGER_RANGE,
  type ScopeControls,
} from './scope-state'
import { useScopeTrace } from './use-scope-trace'
import { SHAPES, type Shape } from './waveform'

/**
 * A bench oscilloscope. The glass shows the trace over a division
 * grid, with lit readouts of the input and the timebase. The chassis
 * carries the shape buttons and six knobs; each knob changes the
 * trace.
 */
export function ScopeDevice() {
  const [controls, setControls] = useState<ScopeControls>(DEFAULT_CONTROLS)
  const controlsRef = useRef(controls)
  controlsRef.current = controls
  const trace = useScopeTrace(controlsRef)
  const set = <K extends keyof ScopeControls>(key: K) => (v: ScopeControls[K]) =>
    setControls((c) => ({ ...c, [key]: v }))

  return (
    <Panel style={CHASSIS}>
      <span className="chrome-emboss" style={BRAND}>PHOSPHOR · OS-1</span>
      <Display raised={false} padding={0}>
        <div style={TRACE}>
          <CrtSurface passes={trace.passes} stage={trace.stage} presetFn={trace.presetFn} style={FULL_BLEED} />
          <Graticule />
        </div>
        <div className="screen-row" style={READOUTS}>
          <span className="screen-row-label">{formatShape(controls.shape)}</span>
          <span>{formatHz(controls.freqHz)}</span>
          <span>{formatTimePerDiv(controls.timePerDivSec)}</span>
          <span className="screen-row-readout">Trig {formatLevel(controls.triggerLevel)}</span>
        </div>
      </Display>

      <div style={CENTERED_ROW}>
        <Tabs tabs={SHAPE_TABS} active={controls.shape} onSelect={(k) => set('shape')(k as Shape)} />
      </div>
      <div style={EVEN_ROW}>
        <Knob {...knob(controls.freqHz, FREQ_RANGE, DEFAULT_CONTROLS.freqHz)} scale="log" label="freq" format={formatHz} onChangeBaseline={set('freqHz')} />
        <Knob {...knob(controls.amp, AMP_RANGE, DEFAULT_CONTROLS.amp)} label="amp" format={formatFraction} onChangeBaseline={set('amp')} />
        <Knob {...knob(controls.timePerDivSec, TIME_PER_DIV_RANGE, DEFAULT_CONTROLS.timePerDivSec)} scale="log" label="time/div" format={formatTimePerDiv} onChangeBaseline={set('timePerDivSec')} />
        <Knob {...knob(controls.triggerLevel, TRIGGER_RANGE, DEFAULT_CONTROLS.triggerLevel)} label="trigger" format={formatLevel} onChangeBaseline={set('triggerLevel')} />
        <Knob {...knob(controls.persistence, PERSISTENCE_RANGE, DEFAULT_CONTROLS.persistence)} label="persist" format={formatFraction} onChangeBaseline={set('persistence')} />
        <Knob {...knob(controls.intensity, INTENSITY_RANGE, DEFAULT_CONTROLS.intensity)} label="intensity" format={formatFraction} onChangeBaseline={set('intensity')} />
      </div>
    </Panel>
  )
}

/** The props every knob shares: no modulation, so value and baseline agree. */
function knob(value: number, range: [number, number], defaultValue: number) {
  return { value, baseline: value, range, defaultValue, size: KNOB_SIZE }
}

// ─── Constants ───────────────────────────────────────────────────────

const SHAPE_TABS = SHAPES.map((s) => ({ key: s.key, label: s.label }))
const KNOB_SIZE = 52

const CHASSIS: CSSProperties = { padding: 20, width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }
/* Pulled up and down so the brand sits centred in the band between
   the panel's top edge and the screen (~14px each side). */
const BRAND: CSSProperties = { fontSize: 11, letterSpacing: '0.2em', lineHeight: 1, margin: '-8px 0 -6px' }
/* The trace area keeps the grid's shape, so every division is square. */
const TRACE: CSSProperties = { position: 'relative', aspectRatio: `${DIVISIONS_X} / ${DIVISIONS_Y}` }
const FULL_BLEED: CSSProperties = { position: 'absolute', inset: 0 }
const READOUTS: CSSProperties = { fontSize: '0.7rem', padding: '8px var(--screen-inset)' }
const CENTERED_ROW: CSSProperties = { display: 'flex', justifyContent: 'center' }
/* Wraps on narrow screens instead of pushing the page sideways. */
const EVEN_ROW: CSSProperties = { display: 'flex', flexWrap: 'wrap', rowGap: 16, alignItems: 'flex-start', justifyContent: 'space-evenly' }
