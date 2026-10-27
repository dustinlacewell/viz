import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { dial, read, sine, type Dials } from '@ldlework/dials'
import { Panel } from '@ldlework/dials/react'
import { dialPanelComponents, makeDialPanelComponents } from '@ldlework/phosphor-dials'
import '@ldlework/phosphor-dials/styles.css'

/**
 * `dialPanelComponents` renders a dials `Panel` with phosphor parts.
 * Pass it to `<Panel components={...}>`. Each dial shows as a knob
 * with its title above it.
 */
const meta: Meta<typeof Panel> = {
  title: 'Phosphor-Dials/Panel',
  component: Panel,
}
export default meta

const synthDials: Dials = {
  freq: dial(600, { min: 50, max: 3000, scale: 'log', description: 'Oscillator pitch, in Hz.' }),
  amp: dial(0.5, { min: 0, max: 1, description: 'Output level, 0 to full.' }),
  detune: dial(0, { min: -100, max: 100, unit: '¢', description: 'Pitch offset in cents.' }),
}

/**
 * A panel of three dials. Drag a knob up or down to change its value.
 * Hover a title to read what the dial does.
 */
export const Default: StoryObj<typeof Panel> = {
  render: () => (
    <Panel title="Synth" dials={synthDials} components={dialPanelComponents} />
  ),
}

/**
 * The host samples its dials every frame with `read(dials, { t, dt })`.
 * That sample is the live value the knob shows. Stories that move on
 * their own run that frame loop with this hook.
 */
function useSampleLoop(...dials: Dials[]) {
  useEffect(() => {
    let last = performance.now()
    let raf = requestAnimationFrame(function tick(now: number) {
      const dt = (now - last) / 1000
      last = now
      for (const d of dials) read(d, { t: now / 1000, dt })
      raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, dials)
}

const modDials: Dials = {
  amp: dial(0.5, {
    min: 0,
    max: 1,
    mod: sine({ freq: 0.5 }),
    depth: 0.3,
    description: 'Output level, swung by a sine.',
  }),
}

function LiveModulationPanel() {
  useSampleLoop(modDials)
  return (
    <Panel
      title="Modulatable"
      dials={modDials}
      components={dialPanelComponents}
    />
  )
}

/**
 * Modulation. `amp` starts with a sine attached, so the knob moves on
 * its own. The white band is the range the sine swings through.
 * Right-drag the knob up or down to widen or narrow the band. Left-drag
 * moves the set point and the band with it. Right-click the knob to
 * open the picker: pick another source, or set the mode (both ways,
 * up, down) in its footer. The sine's own dials sit in the nested panel
 * below, and they modulate the same way.
 */
export const WithModulation: StoryObj<typeof Panel> = {
  render: () => <LiveModulationPanel />,
}

/** Two panels side by side, tops aligned. */
const PAIR = { display: 'flex', gap: 24, alignItems: 'flex-start' } as const

// ─── Bundle options ──────────────────────────────────────────────────

/**
 * `knobSize` sets the knob diameter for the whole bundle. Here it is
 * 40 px, for dense node UIs. Drag a knob up or down, as in Default.
 */
export const SmallKnobs: StoryObj<typeof Panel> = {
  render: () => (
    <Panel
      title="Compact"
      dials={{
        a: dial(0.5, { min: 0, max: 1, description: 'A.' }),
        b: dial(0.5, { min: 0, max: 1, description: 'B.' }),
      }}
      components={makeDialPanelComponents({ knobSize: 40 })}
    />
  ),
}

const blurDials: Dials = {
  radius: dial(4, { min: 0, max: 32, unit: 'px', description: 'Blur radius.' }),
  mix: dial(1, { min: 0, max: 1, description: 'Wet / dry mix.' }),
}

const belowComponents = makeDialPanelComponents({ caption: 'below' })

/**
 * `caption: 'below'` drops the title above each knob. The knob draws
 * its own label and value under its face, for dense node UIs. Drag a
 * knob up or down and watch the value under it.
 */
export const CaptionBelow: StoryObj<typeof Panel> = {
  render: () => <Panel title="Blur" dials={blurDials} components={belowComponents} />,
}

const filterDials = (): Dials => ({
  cutoff: dial(0.5, { min: 0, max: 1, description: 'Filter cutoff.' }),
  resonance: dial(0.2, { min: 0, max: 1, description: 'Filter resonance.' }),
})
const dialPlacedDials = filterDials()
const rowPlacedDials = filterDials()
const rowAttachComponents = makeDialPanelComponents({ attachPlacement: 'row' })

/**
 * `attachPlacement` sets where the modulation picker lives. `'dial'`,
 * the default, has no button: a source glyph sits in the knob face, and
 * a right-click on the knob opens the picker. `'row'` puts a glyph
 * button to the right of the knob. Click it to open the picker.
 */
export const AttachPlacement: StoryObj<typeof Panel> = {
  render: () => (
    <div style={PAIR}>
      <Panel title="dial" dials={dialPlacedDials} components={dialPanelComponents} />
      <Panel title="row" dials={rowPlacedDials} components={rowAttachComponents} />
    </div>
  ),
}

const glideDials = (): Dials => ({
  zoom: dial(0.5, {
    min: 0,
    max: 1,
    glidable: true,
    glide: 1.5,
    description: 'Recursion zoom, glided 1.5 s.',
  }),
})
const glideAt2 = glideDials()
const glideAt3 = glideDials()
const glideMax3Components = makeDialPanelComponents({ glideMax: 3 })

function GlidePair() {
  useSampleLoop(glideAt2, glideAt3)
  return (
    <div style={PAIR}>
      <Panel title="max 2 s" dials={glideAt2} components={dialPanelComponents} />
      <Panel title="max 3 s" dials={glideAt3} components={glideMax3Components} />
    </div>
  )
}

/**
 * The bar under the knob shows the glide time against `glideMax`. Both
 * slots glide 1.5 s. That is three quarters of a bar at the default
 * 2 s, and half a bar at 3 s. Drag a knob. The needle eases to the new
 * value over the glide time. SHIFT + right-drag a knob up or down to
 * change its glide.
 */
export const GlideMax: StoryObj<typeof Panel> = {
  render: () => <GlidePair />,
}
