import { useEffect, useReducer, useState, type CSSProperties, type MouseEvent } from 'react'
import { Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react'
import { ArcGauge, Display, Knob, Panel, PushButton } from '@ldlework/phosphor'

/**
 * A streaming player as a retro-future walkman. The glass shows the
 * track, a spectrum, and a seekable progress bar; the chassis carries
 * the volume knob, bass/treble arcs, and the transport keys. The
 * spectrum follows volume and EQ, so every control visibly does
 * something.
 */
export function WalkmanShowcase() {
  const [player, dispatch] = useReducer(playerReducer, INITIAL_PLAYER)
  const [volume, setVolume] = useState(70)
  const [bass, setBass] = useState(0)
  const [treble, setTreble] = useState(0)
  const t = usePlaybackClock(player.playing, dispatch)
  const track = TRACKS[player.index]!
  const bars = spectrum(player.playing ? t : null, volume / 100, bass, treble)

  return (
    <Panel style={{ padding: 20, width: 380, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Display padding={16} footer={<span className="chrome-emboss" style={BRAND}>PHOSPHOR · PM-1</span>}>
        <div className="screen-rows">
          <div className="screen-row">
            <span className="screen-row-label">
              Track {pad2(player.index + 1)} / {pad2(TRACKS.length)}
            </span>
            <span className="screen-row-readout">{player.playing ? 'Playing' : 'Paused'}</span>
          </div>
          <div>
            <div className="screen-row" style={TITLE}>{track.title}</div>
            <div className="screen-row" style={ARTIST}>{track.artist}</div>
          </div>
          <Spectrum bars={bars} />
          <div>
            <ProgressBar
              fraction={player.elapsed / track.seconds}
              onSeek={(f) => dispatch({ type: 'seek', seconds: Math.round(f * track.seconds) })}
            />
            <div className="screen-row" style={TIMES}>
              <span>{formatTime(player.elapsed)}</span>
              <span>-{formatTime(track.seconds - player.elapsed)}</span>
            </div>
          </div>
        </div>
      </Display>

      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <ArcGauge value={bass} range={[-12, 12]} step={1} defaultValue={0} label="bass" format={formatDb} onChange={setBass} />
        <Knob
          value={volume}
          baseline={volume}
          range={[0, 100]}
          step={1}
          defaultValue={70}
          size={64}
          label="vol"
          format={(v) => `${Math.round(v)}`}
          onChangeBaseline={setVolume}
        />
        <ArcGauge value={treble} range={[-12, 12]} step={1} defaultValue={0} label="treble" format={formatDb} onChange={setTreble} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
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
      </div>
    </Panel>
  )
}

// ─── Player state (pure) ─────────────────────────────────────────────

interface Track {
  title: string
  artist: string
  seconds: number
}

const TRACKS: readonly Track[] = [
  { title: 'Night Drive', artist: 'The Phosphors', seconds: 214 },
  { title: 'Cathode Bloom', artist: 'Halation', seconds: 187 },
  { title: 'Slow Decay', artist: 'Persistence', seconds: 242 },
  { title: 'Beam Current', artist: 'Raster Kids', seconds: 198 },
  { title: 'Afterglow', artist: 'The Phosphors', seconds: 263 },
  { title: 'Vertical Hold', artist: 'Sync Pulse', seconds: 176 },
  { title: 'Grain', artist: 'Halation', seconds: 221 },
  { title: 'White Hot', artist: 'Saturation Knee', seconds: 205 },
]

interface PlayerState {
  index: number
  elapsed: number
  playing: boolean
  shuffle: boolean
}

type PlayerAction =
  | { type: 'toggle' }
  | { type: 'shuffle' }
  | { type: 'tick'; rand: number }
  | { type: 'next'; rand: number }
  | { type: 'prev' }
  | { type: 'seek'; seconds: number }

const INITIAL_PLAYER: PlayerState = { index: 0, elapsed: 0, playing: false, shuffle: false }

/** Seconds into a track after which Previous restarts it instead of going back. */
const RESTART_AFTER = 3

function playerReducer(s: PlayerState, a: PlayerAction): PlayerState {
  switch (a.type) {
    case 'toggle':
      return { ...s, playing: !s.playing }
    case 'shuffle':
      return { ...s, shuffle: !s.shuffle }
    case 'tick':
      return s.elapsed + 1 >= TRACKS[s.index]!.seconds
        ? { ...s, index: nextIndex(s, a.rand), elapsed: 0 }
        : { ...s, elapsed: s.elapsed + 1 }
    case 'next':
      return { ...s, index: nextIndex(s, a.rand), elapsed: 0 }
    case 'prev':
      return s.elapsed > RESTART_AFTER
        ? { ...s, elapsed: 0 }
        : { ...s, index: (s.index - 1 + TRACKS.length) % TRACKS.length, elapsed: 0 }
    case 'seek':
      return { ...s, elapsed: a.seconds }
  }
}

/** The following track, or a random other one when shuffling. `rand` is in [0, 1). */
function nextIndex(s: PlayerState, rand: number): number {
  if (!s.shuffle) return (s.index + 1) % TRACKS.length
  const offset = 1 + Math.floor(rand * (TRACKS.length - 1))
  return (s.index + offset) % TRACKS.length
}

// ─── Spectrum (pure) ─────────────────────────────────────────────────

const BAR_COUNT = 16

/**
 * Bar heights in [0, 1]. Each band wobbles on its own sine; bass and
 * treble (dB) tilt the low and high bands; volume scales the lot.
 * `t` null means paused — every bar rests at zero.
 */
function spectrum(t: number | null, volume: number, bassDb: number, trebleDb: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    if (t === null) return 0
    const x = i / (BAR_COUNT - 1)
    const contour = 1 - 0.5 * x
    const wobble = 0.45 + 0.55 * Math.abs(Math.sin(t * (1.3 + i * 0.37) + i * 1.7))
    const eqDb = bassDb * (1 - x) ** 2 + trebleDb * x ** 2
    return Math.min(1, volume * contour * wobble * 10 ** (eqDb / 20))
  })
}

// ─── Clock (shell) ───────────────────────────────────────────────────

const FRAME_MS = 100

/**
 * While playing, advances the track one second per second and returns
 * an animation time (seconds) for the spectrum.
 */
function usePlaybackClock(playing: boolean, dispatch: (a: PlayerAction) => void): number {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!playing) return
    let frames = 0
    const id = window.setInterval(() => {
      setT((x) => x + FRAME_MS / 1000)
      frames += 1
      if (frames % (1000 / FRAME_MS) === 0) dispatch({ type: 'tick', rand: Math.random() })
    }, FRAME_MS)
    return () => window.clearInterval(id)
  }, [playing, dispatch])
  return t
}

// ─── Glass pieces ────────────────────────────────────────────────────

const LIT_GLOW = '0 0 6px color-mix(in oklch, var(--theme-lit) 60%, transparent)'
const UNLIT = 'oklch(0.78 0.04 var(--theme-hue) / 0.18)'

function Spectrum({ bars }: { bars: number[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${Math.max(4, h * 100)}%`,
            background: h > 0 ? 'var(--theme-lit)' : UNLIT,
            boxShadow: h > 0 ? LIT_GLOW : 'none',
            transition: 'height 100ms linear',
          }}
        />
      ))}
    </div>
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

const SOLID_ICON = { size: 16, fill: 'currentColor', strokeWidth: 0 } as const
const LINE_ICON = { size: 16, strokeWidth: 2.5 } as const

const BRAND: CSSProperties = { fontSize: 11, letterSpacing: '0.2em' }
const TITLE: CSSProperties = { fontSize: '1.1rem' }
const ARTIST: CSSProperties = { color: 'var(--theme-lit)', marginTop: 4 }
const TIMES: CSSProperties = { fontSize: '0.7rem' }

const pad2 = (n: number) => n.toString().padStart(2, '0')

function formatTime(seconds: number): string {
  return `${pad2(Math.floor(seconds / 60))}:${pad2(seconds % 60)}`
}

function formatDb(db: number): string {
  return `${db > 0 ? '+' : ''}${Math.round(db)}dB`
}
