import type { Meta, StoryObj } from '@storybook/react'
import { useRef, type ReactNode } from 'react'
import { CrtSurface, type CrtSurfaceProps, type PassFactory } from '@ldlework/crt/react'
import { PHOSPHOR_BEAUTY, PHOSPHOR_P31, PHOSPHOR_P39, PHOSPHOR_P7, type CrtPreset } from '@ldlework/crt'
import { DepositPass, makeSegmentPump, type BeamFn, type SegmentPump } from '@ldlework/scope'

/**
 * `CrtSurface` runs the phosphor chain on a canvas: fade, then your
 * passes, then glow, then output. It draws nothing by itself. Each
 * story here gives it one pass, from `@ldlework/scope`: a beam spot
 * that runs along a Lissajous figure.
 */
const meta: Meta<typeof CrtSurface> = {
  title: 'Crt/CrtSurface',
  component: CrtSurface,
}
export default meta

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

type SpotProps = Omit<CrtSurfaceProps, 'passes' | 'stage'> & { size?: number }

/** A black square with a CrtSurface that draws the beam spot. */
function Spot({ size = 240, ...surface }: SpotProps) {
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
    <div style={{ width: size, height: size, background: '#000', borderRadius: 4 }}>
      <CrtSurface {...surface} passes={passes} stage={stage} />
    </div>
  )
}

/** A caption above a surface. */
function Captioned({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ color: '#9a8f86', fontFamily: 'var(--font-mono, monospace)', fontSize: 11 }}>
        {caption}
      </span>
      {children}
    </div>
  )
}

/**
 * `passes` builds the drawing passes once, at mount. `stage` runs
 * before each frame to feed them. Here one pass draws the beam spot.
 * Look at the spot: the surface adds the fading trail and the glow.
 */
export const Passes: StoryObj<typeof CrtSurface> = {
  render: () => <Spot size={320} />,
}

const PRESETS: [string, CrtPreset][] = [
  ['P31', PHOSPHOR_P31],
  ['P7', PHOSPHOR_P7],
  ['P39', PHOSPHOR_P39],
  ['BEAUTY', PHOSPHOR_BEAUTY],
]

/**
 * A preset is a plain object of display settings. Spread one onto the
 * surface. Compare the four trails. P31, the default, leaves a short
 * trail. P39 leaves a longer one, and P7 the longest. BEAUTY adds a
 * wide glow.
 */
export const Presets: StoryObj<typeof CrtSurface> = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: 16 }}>
      {PRESETS.map(([name, preset]) => (
        <Captioned key={name} caption={name}>
          <Spot size={200} {...preset} />
        </Captioned>
      ))}
    </div>
  ),
}

/**
 * `persistence` is the share of brightness a trace keeps each frame.
 * Left: 0.86, the default, a short trail. Right: 0.985, a trail that
 * lasts for seconds.
 */
export const Persistence: StoryObj<typeof CrtSurface> = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {[0.86, 0.985].map((persistence) => (
        <Captioned key={persistence} caption={`persistence ${persistence}`}>
          <Spot size={200} persistence={persistence} />
        </Captioned>
      ))}
    </div>
  ),
}

/**
 * `presetFn` returns settings each frame, so they change without a
 * React render. Here it swings `intensity` up and down every two
 * seconds. Look at the trail: bright and dim stretches alternate.
 */
export const PresetFn: StoryObj<typeof CrtSurface> = {
  render: () => <Spot size={320} presetFn={(t) => ({ intensity: 0.55 + 0.45 * Math.sin(t * Math.PI) })} />,
}

/**
 * `phosphorColor` locks the trace color, as [r, g, b] from 0 to 1.
 * Without it the trace takes `--theme-lit-bright` from the page. Here
 * the trace is green.
 */
export const PhosphorColor: StoryObj<typeof CrtSurface> = {
  render: () => <Spot size={320} phosphorColor={[0.35, 1, 0.45]} />,
}
