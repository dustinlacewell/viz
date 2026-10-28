import { useCallback, useRef, useState } from 'react'
import { CrtSurface } from '@ldlework/crt/react'
import { CodeBlock, Display, Tabs } from '@ldlework/phosphor'
import { GITHUB_HREF, STORYBOOK_HREF } from '../../shared/pages'
import {
  PHOSPHOR_P31, PHOSPHOR_P7, PHOSPHOR_P39, PHOSPHOR_BEAUTY,
  type CrtPreset,
} from '@ldlework/crt'
import { useWireDemo } from './demo/use-wire-demo'

/*
 * Live demo: a turning wireframe that morphs between a cube, a sphere
 * and a pyramid, painted as StampPass dots (see ./demo). Persistence,
 * halation, tonemap and the phosphor glow are crt's own effect chain
 * on top of those bare deposits.
 */

interface PresetOption {
  name: string
  preset: CrtPreset
  char: string
}

/*
 * crt's presets carry no color, so the trace follows the page theme.
 * The demo gives each coating its real emission color so the tabs
 * visibly change the screen. Beauty keeps the theme color.
 */
const P31_GREEN = [0.3, 1, 0.4] as const
const P39_YELLOW_GREEN = [0.7, 1, 0.25] as const

/*
 * P7 is a two-layer cascade: a blue flash while the beam is on, then a
 * long yellow-green afterglow. crt bleaches the brightest light toward
 * `whitePoint`, and fresh light is the brightest, so a blue white
 * point with a low bleach knee draws the new lines blue and lets them
 * fade to yellow-green.
 */
const P7_CASCADE = {
  ...PHOSPHOR_P7,
  phosphorColor: [0.75, 1, 0.3],
  whitePoint: [0.45, 0.65, 1],
  saturationKnee: 0.5,
  whiteHot: 1.5,
} as const

const PRESETS: PresetOption[] = [
  {
    name: 'PHOSPHOR_P31',
    preset: { ...PHOSPHOR_P31, phosphorColor: P31_GREEN },
    char: 'ZnS:Cu yellow-green — short persistence; the classic oscilloscope phosphor (the component defaults target it).',
  },
  {
    name: 'PHOSPHOR_P7',
    preset: P7_CASCADE,
    char: 'Cascade blue→yellow-green — long persistence; the fade lingers for visible seconds. Radar / slow-scan look.',
  },
  {
    name: 'PHOSPHOR_P39',
    preset: { ...PHOSPHOR_P39, phosphorColor: P39_YELLOW_GREEN },
    char: 'ZnO:Zn slow-scan yellow-green — medium persistence; a heavier ghost trail than P31, less saturated than P7.',
  },
  {
    name: 'PHOSPHOR_BEAUTY',
    preset: PHOSPHOR_BEAUTY,
    char: 'Exaggerated halation and blown highlights — not strictly physical. For when the trace is the design, not instrumentation.',
  },
]

export function App() {
  const canvasElRef = useRef<HTMLDivElement | null>(null)
  const { passes, stage } = useWireDemo(canvasElRef)
  const [presetIndex, setPresetIndex] = useState(0)
  const presetIndexRef = useRef(0)
  presetIndexRef.current = presetIndex

  const presetFn = useCallback(
    (): CrtPreset => PRESETS[presetIndexRef.current]!.preset,
    [],
  )

  const active = PRESETS[presetIndex]!

  return (
    <div className="site">
      <section className="site-section site-hero">
        <div className="site-container">
          <p className="site-eyebrow">crt</p>
          <h1 className="site-h1">A phosphor display renderer.</h1>
          <p className="site-prose site-hero-desc">
            Renders whatever you draw into it as if it were painted onto a real
            cathode-ray-tube phosphor: an HDR beam accumulator, Kohlrausch
            stretched-exponential persistence, separable halation, and an
            ACES-shoulder tonemap with phosphor-color modulation. crt is
            content-agnostic — it owns the effect chain, not what gets drawn.
          </p>
          <div className="site-links">
            <a href="https://www.npmjs.com/package/@ldlework/crt" target="_blank" rel="noreferrer">npm</a>
            <a href={GITHUB_HREF} target="_blank" rel="noreferrer">GitHub</a>
            <a href={STORYBOOK_HREF}>Storybook</a>
          </div>
        </div>
      </section>

      <section className="site-section" id="install">
        <div className="site-container site-container--narrow">
          <h2 className="site-h2">Install</h2>
          <CodeBlock lang="bash" code="pnpm add @ldlework/crt" />
          <p className="site-prose site-install-prose">
            Bring your own passes — crt owns the effect chain, you own the
            deposits:
          </p>
          <CodeBlock
            lang="tsx"
            code={`import { useCallback, useRef } from 'react'
import { CrtSurface } from '@ldlework/crt/react'
import {
  StampPass, PHOSPHOR_P31,
  type DrawablePass, type DrawCtx,
} from '@ldlework/crt'

function Scanner() {
  const stampRef = useRef<StampPass | null>(null)

  const passes = useCallback((gl: WebGL2RenderingContext): DrawablePass<DrawCtx>[] => {
    const stamp = new StampPass(gl)
    stampRef.current = stamp
    return [stamp]
  }, [])

  const stage = useCallback((t: number) => {
    stampRef.current?.setStamps([{ x: Math.sin(t), y: Math.cos(t), sizePx: 24 }])
  }, [])

  return <CrtSurface passes={passes} stage={stage} {...PHOSPHOR_P31} />
}`}
          />
        </div>
      </section>

      <section className="site-section" id="demo">
        <div className="site-container">
          <h2 className="site-h2">Live demo</h2>
          <p className="site-prose site-demo-hint">
            A wireframe turns while it morphs between a cube, a sphere and a
            pyramid. Pick a coating with the tabs.
          </p>
          <Display fill padding={0} className="demo-display">
            <div className="demo-stage" ref={canvasElRef}>
              <CrtSurface passes={passes} stage={stage} presetFn={presetFn} {...active.preset} />
            </div>
          </Display>
          <div className="demo-presets">
            <Tabs
              tabs={PRESETS.map((p, i) => ({ key: String(i), label: p.name.replace('PHOSPHOR_', '') }))}
              active={String(presetIndex)}
              onSelect={(k) => setPresetIndex(Number(k))}
            />
            <p className="site-prose demo-preset-char">
              <code>{active.name}</code> — {active.char}
            </p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer-links">
          <a href={GITHUB_HREF} target="_blank" rel="noreferrer">GitHub</a>
          <a href={STORYBOOK_HREF}>Storybook</a>
          <a href="https://www.npmjs.com/package/@ldlework/crt" target="_blank" rel="noreferrer">npm</a>
        </div>
        <div>crt · MIT · @ldlework</div>
      </footer>
    </div>
  )
}
