import { useEffect, useState, type CSSProperties } from 'react'
import { Circle, Play, Square } from 'lucide-react'
import {
  LeverSwitch,
  Display,
  Panel,
  PushButton,
  SegmentedDisplay,
} from '@ldlework/phosphor'

type Transport = 'stop' | 'play' | 'rec'

interface Track {
  title: string
  artist: string
  seconds: number
}

const TRACKS: readonly Track[] = [
  { title: 'Night Drive', artist: 'The Phosphors', seconds: 214 },
  { title: 'Cathode Bloom', artist: 'Halation', seconds: 187 },
  { title: 'Slow Decay', artist: 'Persistence', seconds: 242 },
]

const ICON = { size: 14, fill: 'currentColor', strokeWidth: 0 } as const
const LEVEL_FLOOR = -60
/** Narrow lever modes so the switch fits beside the transport keys. */
const LEVER_SIZE = { '--lever-w': '64px' } as CSSProperties

/**
 * A pretend tape-deck face — Panel as the chassis, a Display with the
 * track on the glass and counter + level readouts on its header
 * strip, PushButtons for transport, and a LeverSwitch for monitor
 * mode. The counter runs while playing or recording and rolls over
 * to the next track at the end of one.
 */
export function TapeDeckShowcase() {
  const [transport, setTransport] = useState<Transport>('stop')
  const [monitor, setMonitor] = useState<'left' | 'right'>('left')
  const { track, elapsed, level } = useTapeClock(transport)

  return (
    <Panel style={{ padding: 20, width: 400 }}>
      <Display
        padding={16}
        header={
          <>
            <SegmentedDisplay ghost="88:88" style={{ flex: 1 }}>
              {formatTime(elapsed)}
            </SegmentedDisplay>
            <SegmentedDisplay ghost="-88.8" style={{ flex: 1 }}>
              {formatLevel(level)}
            </SegmentedDisplay>
          </>
        }
        footer={
          <span
            className="chrome-emboss"
            style={{ fontSize: 11, letterSpacing: '0.2em' }}
          >
            PHOSPHOR · MK II
          </span>
        }
      >
        <div className="screen-rows">
          <div className="screen-row">
            <span className="screen-row-label">{track.title}</span>
            <span className="screen-row-readout">{formatTime(track.seconds)}</span>
          </div>
          <div className="screen-row">
            <span className="screen-row-label">{track.artist}</span>
          </div>
        </div>
        <div className="screen-divider" />
        <div className="screen-rows">
          <div className="screen-chip-row">
            <span className="screen-chip" data-lit={transport === 'play' ? 'true' : 'false'}>
              PLAY
            </span>
            <span className="screen-chip" data-lit={transport === 'rec' ? 'alt' : 'false'}>
              REC
            </span>
            <span className="screen-chip" data-lit={transport === 'stop' ? 'true' : 'false'}>
              STOP
            </span>
          </div>
          <div className="screen-row">
            <span className="screen-row-label">Monitor</span>
            <span className="screen-row-readout">
              {monitor === 'left' ? 'TAPE' : 'SOURCE'}
            </span>
          </div>
        </div>
      </Display>

      <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
        <PushButton aria-label="Play" selected={transport === 'play'} onClick={() => setTransport('play')}>
          <Play {...ICON} />
        </PushButton>
        <PushButton aria-label="Stop" selected={transport === 'stop'} onClick={() => setTransport('stop')}>
          <Square {...ICON} />
        </PushButton>
        <PushButton aria-label="Record" selected={transport === 'rec'} onClick={() => setTransport('rec')}>
          <Circle {...ICON} />
        </PushButton>
        <div style={{ flex: 1 }} />
        <LeverSwitch
          left="TAPE"
          right="SRC"
          position={monitor}
          onChange={setMonitor}
          style={LEVER_SIZE}
        />
      </div>
    </Panel>
  )
}

/**
 * Tape position and meter level. Ticks once a second while the
 * transport runs; the level sits at the floor when stopped.
 */
function useTapeClock(transport: Transport) {
  const [trackIndex, setTrackIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [level, setLevel] = useState(LEVEL_FLOOR)
  const track = TRACKS[trackIndex]!

  useEffect(() => {
    if (transport === 'stop') {
      setLevel(LEVEL_FLOOR)
      return
    }
    const id = window.setInterval(() => {
      setElapsed((e) => e + 1)
      setLevel(-3 - Math.random() * 9)
    }, 1000)
    return () => window.clearInterval(id)
  }, [transport])

  useEffect(() => {
    if (elapsed < track.seconds) return
    setElapsed(0)
    setTrackIndex((i) => (i + 1) % TRACKS.length)
  }, [elapsed, track.seconds])

  return { track, elapsed, level }
}

const pad2 = (n: number) => n.toString().padStart(2, '0')

function formatTime(seconds: number): string {
  return `${pad2(Math.floor(seconds / 60))}:${pad2(seconds % 60)}`
}

/** Always "-DD.D", so the lit text lines up with the "-88.8" ghost. */
function formatLevel(db: number): string {
  return `-${Math.abs(db).toFixed(1).padStart(4, '0')}`
}
