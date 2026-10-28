import { useReducer, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react'
import { ArcGauge, ChipToggle, Display, KeyBank, Knob, Panel, PushButton } from '@ldlework/phosphor'
import { CrtScreen, useCrtRegion } from '@ldlework/phosphor-crt'
import type { MeterMode } from './meter-beam'
import { INITIAL_PLAYER, playerReducer, TRACKS } from './player'
import { useMeterCrt, type MeterInputs } from './use-meter-crt'
import { usePlaybackClock } from './use-playback-clock'

/**
 * A streaming player as a retro-future walkman. The screen is set
 * into the chassis; it shows the track, a meter, and a seekable
 * progress bar. The meter is drawn into a CRT behind the glass: LED
 * bars or a waveform, picked on the glass. The chassis also carries
 * the volume knob, bass/treble arcs, and the transport keys. The
 * meter follows volume and EQ, so every control visibly does
 * something.
 */
export function WalkmanShowcase() {
  const [player, dispatch] = useReducer(playerReducer, INITIAL_PLAYER)
  const [volume, setVolume] = useState(70)
  const [bass, setBass] = useState(0)
  const [treble, setTreble] = useState(0)
  const [mode, setMode] = useState<MeterMode>('bars')
  usePlaybackClock(player.playing, dispatch)
  const track = TRACKS[player.index]!

  const inputs: MeterInputs = { mode, playing: player.playing, volume, bassDb: bass, trebleDb: treble }
  const meterInputs = useRef(inputs)
  meterInputs.current = inputs
  const meterRegion = useCrtRegion<HTMLDivElement>()
  const meterCrt = useMeterCrt(meterInputs, meterRegion)

  return (
    <Panel style={{ padding: 20, width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <span className="chrome-emboss" style={BRAND}>PHOSPHOR · PM-1</span>
      <Display raised={false}>
        <CrtScreen passes={meterCrt.passes} stage={meterCrt.stage} persistence={METER_PERSISTENCE} />
        <div className="screen-rows">
          <div className="screen-row">
            <span className="screen-row-label">
              Track {pad2(player.index + 1)} / {pad2(TRACKS.length)}
            </span>
            <span className="screen-chip" data-lit={player.shuffle ? 'true' : 'false'}>Shuffle</span>
            <span className="screen-row-readout">{player.playing ? 'Playing' : 'Paused'}</span>
          </div>
          <div>
            <div className="screen-row" style={TITLE}>{track.title}</div>
            <div className="screen-row" style={ARTIST}>{track.artist}</div>
          </div>
          <div ref={meterRegion.ref} style={METER} />
          <div>
            <ProgressBar
              fraction={player.elapsed / track.seconds}
              onSeek={(f) => dispatch({ type: 'seek', seconds: Math.round(f * track.seconds) })}
            />
            <div className="screen-row" style={TIMES}>
              <span>{formatTime(player.elapsed)}</span>
              <MeterModeChips mode={mode} onChange={setMode} />
              <span>-{formatTime(track.seconds - player.elapsed)}</span>
            </div>
          </div>
        </div>
      </Display>

      <div style={EVEN_ROW}>
        <KeyBank>
          <PushButton aria-label="Shuffle" selected={player.shuffle} onClick={() => dispatch({ type: 'shuffle' })}>
            <Shuffle {...LINE_ICON} />
          </PushButton>
          <PushButton aria-label="Previous" onClick={() => dispatch({ type: 'prev' })}>
            <SkipBack {...SOLID_ICON} />
          </PushButton>
          <PushButton
            aria-label={player.playing ? 'Pause' : 'Play'}
            selected={player.playing}
            onClick={() => dispatch({ type: 'toggle' })}
          >
            {player.playing ? <Pause {...SOLID_ICON} /> : <Play {...SOLID_ICON} />}
          </PushButton>
          <PushButton aria-label="Next" onClick={() => dispatch({ type: 'next', rand: Math.random() })}>
            <SkipForward {...SOLID_ICON} />
          </PushButton>
        </KeyBank>
        <ArcGauge value={bass} range={[-12, 12]} step={1} defaultValue={0} label="bass" format={formatDb} onChange={setBass} />
        <ArcGauge value={treble} range={[-12, 12]} step={1} defaultValue={0} label="treble" format={formatDb} onChange={setTreble} />
        <Knob
          value={volume}
          baseline={volume}
          range={[0, 100]}
          step={1}
          defaultValue={70}
          size={52}
          label="vol"
          format={(v) => `${Math.round(v)}`}
          onChangeBaseline={setVolume}
        />
      </div>
    </Panel>
  )
}

// ─── Glass pieces ────────────────────────────────────────────────────

const LIT_GLOW = '0 0 6px color-mix(in oklch, var(--theme-lit) 60%, transparent)'
const UNLIT = 'oklch(0.78 0.04 var(--theme-hue) / 0.18)'

const METER_MODES: readonly { mode: MeterMode; label: string }[] = [
  { mode: 'bars', label: 'Bars' },
  { mode: 'wave', label: 'Wave' },
]

function MeterModeChips({ mode, onChange }: { mode: MeterMode; onChange: (m: MeterMode) => void }) {
  return (
    <span className="screen-chip-row">
      {METER_MODES.map((m) => (
        <ChipToggle key={m.mode} value={mode === m.mode} onChange={() => onChange(m.mode)}>
          {m.label}
        </ChipToggle>
      ))}
    </span>
  )
}

function ProgressBar({ fraction, onSeek }: { fraction: number; onSeek: (f: number) => void }) {
  const seek = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    onSeek(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
  }
  return (
    <div onClick={seek} style={{ padding: '6px 0', cursor: 'pointer' }}>
      <div style={{ height: 3, background: UNLIT }}>
        <div style={{ width: `${fraction * 100}%`, height: '100%', background: 'var(--theme-lit)', boxShadow: LIT_GLOW }} />
      </div>
    </div>
  )
}

// ─── Constants and formatting ────────────────────────────────────────

/* Filled and stroked: the skip icons draw their bar as a stroke. */
const SOLID_ICON = { size: 16, fill: 'currentColor', strokeWidth: 2 } as const
const LINE_ICON = { size: 16, strokeWidth: 2.5 } as const

/* Pulled up and down so the brand sits centred in the band between
   the panel's top edge and the screen (~14px each side). */
const BRAND: CSSProperties = { fontSize: 11, letterSpacing: '0.2em', lineHeight: 1, margin: '-8px 0 -6px' }
const EVEN_ROW: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }
const TITLE: CSSProperties = { fontSize: '1.1rem' }
const ARTIST: CSSProperties = { color: 'var(--theme-lit)', marginTop: 4 }
/* The meter's box on the glass; the CRT draws into it. */
const METER: CSSProperties = { height: 40 }
/* Per-frame survival of the meter's glow; the default (0.86) trails too long for a meter. */
const METER_PERSISTENCE = 0.7
const TIMES: CSSProperties = { fontSize: '0.7rem' }

const pad2 = (n: number) => n.toString().padStart(2, '0')

function formatTime(seconds: number): string {
  return `${pad2(Math.floor(seconds / 60))}:${pad2(seconds % 60)}`
}

function formatDb(db: number): string {
  return `${db > 0 ? '+' : ''}${Math.round(db)}dB`
}
