import { useState, type CSSProperties } from 'react'
import { Panel as DialsPanel } from '@ldlework/dials/react'
import { CodeBlock, Display, Panel as ChromePanel } from '@ldlework/phosphor'
import { dialPanelComponents } from '@ldlework/phosphor-dials'
import { GITHUB_HREF, STORYBOOK_HREF } from '../../shared/pages'
import { HeroScope } from '../../shared/scope'
import { demoDials, makeDemoPreset } from './demo-scope'

const INSTALL_SNIPPET = `import '@ldlework/phosphor/styles.css'
import '@ldlework/phosphor-dials/styles.css'
import { Panel } from '@ldlework/dials/react'
import { dialPanelComponents } from '@ldlework/phosphor-dials'

<Panel dials={mySurface} components={dialPanelComponents} />`

export function App() {
  return (
    <div className="site">
      <Hero />
      <InstallSection />
      <DemoSection />
      <Footer />
    </div>
  )
}

function Hero() {
  return (
    <section className="site-section site-hero">
      <div className="site-container">
        <p className="site-eyebrow">phosphor-dials</p>
        <h1 className="site-h1">Dials in the phosphor design language.</h1>
        <p className="site-prose site-hero-desc">
          A phosphor-styled component set for{' '}
          <a href="https://www.npmjs.com/package/@ldlework/dials" target="_blank" rel="noreferrer">
            @ldlework/dials
          </a>
          ' Panel. Pass <code>dialPanelComponents</code> to{' '}
          <code>&lt;Panel components={'{...}'}&gt;</code> and the whole dial
          tree — rows, headings, knobs, the modulation picker — renders in
          phosphor's chrome-and-glass chassis. No config, no per-slot
          styling; the same recursive modulation, in the hi-fi vocabulary.
        </p>
        <div className="site-links">
          <a href="https://www.npmjs.com/package/@ldlework/phosphor-dials" target="_blank" rel="noreferrer">npm</a>
          <a href={GITHUB_HREF} target="_blank" rel="noreferrer">GitHub</a>
          <a href={STORYBOOK_HREF}>Storybook</a>
        </div>
      </div>
    </section>
  )
}

function DemoSection() {
  const [preset] = useState(makeDemoPreset)
  return (
    <section className="site-section" id="demo">
      <div className="site-container site-container--narrow">
        <h2 className="site-h2">Live demo</h2>
        <p className="site-prose site-demo-hint">
          A dials <code>Panel</code> rendered through{' '}
          <code>dialPanelComponents</code>. The knobs set the sine wave on the
          CRT above them. Each dial starts with a slow source attached, so the
          trace moves on its own. Drag a knob, or open its "↻" picker to attach
          a different source.
        </p>
        <ChromePanel style={CHASSIS}>
          <Display raised={false} padding={0} cursor>
            <div style={TRACE}>
              <HeroScope noTuning preset={preset} style={FULL_BLEED} />
            </div>
          </Display>
          <div className="pd-demo-horizontal">
            <DialsPanel dials={demoDials} components={dialPanelComponents} />
          </div>
        </ChromePanel>
      </div>
    </section>
  )
}

const CHASSIS: CSSProperties = { padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }
const TRACE: CSSProperties = { position: 'relative', aspectRatio: '16 / 7' }
const FULL_BLEED: CSSProperties = { position: 'absolute', inset: 0 }

function InstallSection() {
  return (
    <section className="site-section" id="install">
      <div className="site-container site-container--narrow">
        <h2 className="site-h2">Install</h2>
        <CodeBlock lang="bash" code="pnpm add @ldlework/phosphor-dials" />
        <p className="site-prose site-install-prose">
          Import both stylesheets once (phosphor's chrome, then this
          package's layout-only CSS), then hand the bundle to dials' Panel:
        </p>
        <CodeBlock lang="tsx" code={INSTALL_SNIPPET} />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-links">
        <a href={GITHUB_HREF} target="_blank" rel="noreferrer">GitHub</a>
        <a href={STORYBOOK_HREF}>Storybook</a>
        <a href="https://www.npmjs.com/package/@ldlework/phosphor-dials" target="_blank" rel="noreferrer">npm</a>
      </div>
      <div>phosphor-dials · MIT · @ldlework</div>
    </footer>
  )
}
