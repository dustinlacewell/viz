import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ChipToggle, Display, Panel } from '@ldlework/phosphor'
import { CrtScreen } from '@ldlework/phosphor-crt'
import type { PassFactory } from '@ldlework/crt/react'
import { DepositPass, makeSegmentPump, type BeamFn, type SegmentPump } from '@ldlework/scope'

const meta: Meta<typeof CrtScreen> = {
  title: 'phosphor-crt/CrtScreen',
  component: CrtScreen,
}
export default meta

/** Empty glass with height, so the CRT has room to draw. */
function Glass({ height = 200 }: { height?: number }) {
  return <div style={{ minHeight: height }} />
}

function Chips() {
  const [lit, setLit] = useState([true, false, false])
  const toggle = (i: number) => setLit((prev) => prev.map((v, j) => (j === i ? !v : v)))
  return (
    <div className="screen-chip-row" style={{ minHeight: 200 }}>
      {['A', 'B', 'C'].map((label, i) => (
        <ChipToggle key={label} value={lit[i] ?? false} onChange={() => toggle(i)}>
          {label}
        </ChipToggle>
      ))}
    </div>
  )
}

/**
 * On a Display with `cursor`, CrtScreen draws the cursor into the
 * phosphor: it glows and leaves a short trail. The chips are HTML on
 * top, so the cursor passes under them. Move the mouse over the glass.
 * Click the chips: clicks still reach them.
 */
export const WithCursor: StoryObj<typeof CrtScreen> = {
  render: () => (
    <Display cursor style={{ width: 420 }}>
      <CrtScreen />
      <Chips />
    </Display>
  ),
}

/**
 * `persistence` sets how much brightness a trace keeps each frame. The
 * default is 0.86. Here it is 0.985, so the trail lasts for seconds.
 * Move the mouse over the glass, then stop: the trail fades slowly.
 */
export const Persistence: StoryObj<typeof CrtScreen> = {
  render: () => (
    <Display cursor style={{ width: 420 }}>
      <CrtScreen persistence={0.985} />
      <Glass />
    </Display>
  ),
}

/**
 * `cursorIntensity` sets how bright the cursor burns into the
 * phosphor. The default is 0.5. Left: 0.2, a faint cursor. Right: 1, a
 * hot cursor with a longer glow. Move the mouse over each glass.
 */
export const CursorIntensity: StoryObj<typeof CrtScreen> = {
  render: () => (
    <Panel style={{ padding: 20, display: 'flex', gap: 24 }}>
      {[0.2, 1].map((intensity) => (
        <div key={intensity} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="chrome-emboss" style={{ fontSize: 11 }}>
            intensity {intensity}
          </span>
          <Display cursor style={{ width: 220 }}>
            <CrtScreen cursorIntensity={intensity} />
            <Glass height={160} />
          </Display>
        </div>
      ))}
    </Panel>
  ),
}

const SEGMENT_CAPACITY = 256
const TURNS_PER_SECOND = 0.25

/**
 * A beam spot that runs along a 3:2 Lissajous figure. Each frame it
 * draws the stretch it covered since the last frame.
 */
const spotBeam: BeamFn = function* (t, dt) {
  const steps = 32
  for (let i = 1; i <= steps; i++) {
    const phase = (t - dt * (1 - i / steps)) * TURNS_PER_SECOND * Math.PI * 2
    yield { x: 0.8 * Math.sin(3 * phase), y: 0.8 * Math.sin(2 * phase) }
  }
}

/**
 * `passes` adds your own drawing under the cursor. `stage` feeds those
 * passes before each frame. Here one pass draws a beam spot along a
 * Lissajous figure. Move the mouse over the glass: the cursor and the
 * spot share the same phosphor.
 */
export const Passes: StoryObj<typeof CrtScreen> = {
  render: function Render() {
    const deposit = useRef<DepositPass | null>(null)
    const pump = useRef<SegmentPump | null>(null)
    const passes: PassFactory = (gl) => {
      deposit.current = new DepositPass(gl, SEGMENT_CAPACITY)
      deposit.current.setBeamWidth(1.5)
      pump.current = makeSegmentPump(SEGMENT_CAPACITY)
      return [deposit.current]
    }
    const stage = (t: number, dt: number) => {
      if (deposit.current && pump.current) deposit.current.setBatch(pump.current.pump(spotBeam, t, dt))
    }
    return (
      <Display cursor style={{ width: 420 }}>
        <CrtScreen passes={passes} stage={stage} />
        <Glass height={240} />
      </Display>
    )
  },
}
