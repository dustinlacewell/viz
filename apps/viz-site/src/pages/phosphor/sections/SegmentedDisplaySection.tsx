import { useEffect, useState } from 'react'
import { Panel, SegmentedDisplay, SegmentedSurface } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { LabeledDisplay } from '../components/LabeledDisplay'
import { PANEL_CELL } from '../components/layout'
import { WeatherGlyph, type WeatherIcon } from '../components/WeatherGlyph'

export function SegmentedDisplaySection() {
  return (
    <DemoRow
      id="segmenteddisplay"
      name="SegmentedDisplay"
      description="A small recessed-glass digit display, the kind a hi-fi unit mounts on its faceplate. Real 7-segment numerals; chamfered rim catches edge-glow."
      demo={<SegmentedDisplayDemo />}
    />
  )
}

/* ============================================================
 * SegmentedDisplay demo — a faux weather/clock dashboard.
 *
 * Decomposed into small reusable pieces:
 *   useNow()           live clock state, ticks once a second
 *   ClockDisplay       HH:MM:SS with all-segments-on ghost
 *   DateDisplay        YYYY-MM-DD ditto
 *   TempDisplay        XX.X with a small °C glyph beside
 *   HumidityDisplay    XXX with a small %rh glyph beside
 *   ForecastCell       weather pictogram in a SegmentedSurface
 *   SegmentedDisplayDemo  composes the above on a Panel
 *
 * Each piece is something a consumer would build in their own app
 * with nothing but the published primitives. The SegmentedSurface
 * primitive is what makes the weather pictograms possible — it's
 * a bare recessed two-layer Display cutout with arbitrary content.
 * ============================================================ */

const GHOST_OFFSET = { x: 1, y: 1 } as const
const pad2 = (n: number) => n.toString().padStart(2, '0')
const pad3 = (n: number) => n.toString().padStart(3, '0')

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

function ClockDisplay() {
  const now = useNow()
  const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`
  return (
    <SegmentedDisplay
      color="oklch(0.85 0.18 145)"
      ghost="88:88:88"
      ghostOffset={GHOST_OFFSET}
    >
      {time}
    </SegmentedDisplay>
  )
}

function DateDisplay() {
  const now = useNow()
  const date = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
  return (
    <SegmentedDisplay ghost="8888-88-88" ghostOffset={GHOST_OFFSET}>
      {date}
    </SegmentedDisplay>
  )
}

/* Inner layout of the weather surface. Rendered TWICE — once for
   the lit layer (with the real icons + numbers) and once for the
   ghost layer (with all-on icons + all-8 digits). Both layers
   share the exact same DOM tree shape so they overlay per-glyph.
   Consumers pass a `variant` discriminating which one to render. */
interface WeatherPanelProps {
  variant: 'lit' | 'ghost'
  current: WeatherIcon
  incoming: WeatherIcon
  temp: number
  humidity: number
}

function WeatherPanel({
  variant,
  current,
  incoming,
  temp,
  humidity,
}: WeatherPanelProps) {
  // For the ghost layer, every glyph/digit becomes its all-on form.
  const cur = variant === 'lit' ? current : 'allOn'
  const inc = variant === 'lit' ? incoming : 'allOn'
  const tempText = variant === 'lit' ? temp.toFixed(1) : '88.8'
  const humText = variant === 'lit' ? pad3(humidity) : '888'
  return (
    <div className="weather-surface">
      <div className="weather-surface-forecast">
        <span className="weather-surface-label">FORECAST</span>
        <div className="weather-surface-forecast-row">
          <WeatherGlyph icon={cur} />
          <span className="weather-surface-arrow">→</span>
          <WeatherGlyph icon={inc} />
        </div>
      </div>

      <div className="weather-surface-readouts">
        <div className="weather-surface-readout">
          <span className="weather-surface-label">TEMPERATURE</span>
          <div className="weather-surface-readout-row">
            <span className="weather-surface-numeric">{tempText}</span>
            <span className="weather-surface-unit">°C</span>
          </div>
        </div>
        <div className="weather-surface-readout">
          <span className="weather-surface-label">HUMIDITY</span>
          <div className="weather-surface-readout-row">
            <span className="weather-surface-numeric">{humText}</span>
            <span className="weather-surface-unit">%rh</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SegmentedDisplayDemo() {
  const weather = { current: 'sun', incoming: 'rain', temp: 23.7, humidity: 53 } as const
  return (
    <Panel
      style={{
        ...PANEL_CELL,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {/* Two text-based displays at the top — Date / Time. Wraps to
          stacked when the panel is too narrow for both side-by-side. */}
      <div className="site-segdemo-row">
        <LabeledDisplay label="Date"><DateDisplay /></LabeledDisplay>
        <LabeledDisplay label="Time"><ClockDisplay /></LabeledDisplay>
      </div>

      {/* One big SegmentedSurface for the whole weather panel. The
          lit + ghost layers render the same WeatherPanel layout
          with different content so they stack per-glyph. */}
      <SegmentedSurface
        lit={<WeatherPanel variant="lit" {...weather} />}
        ghost={<WeatherPanel variant="ghost" {...weather} />}
        ghostOffset={GHOST_OFFSET}
        style={{
          padding: 18,
          // SegmentedSurface inherits `display: inline-grid` from
          // .segdisplay, which sizes to content. Force it to
          // claim the full row width of the Panel above so the
          // weather grid inside has a definite track to work with.
          width: '100%',
          boxSizing: 'border-box',
          flex: 1,
        }}
      />
    </Panel>
  )
}
