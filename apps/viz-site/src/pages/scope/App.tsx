import { CodeBlock } from '@ldlework/phosphor'
import { GITHUB_HREF, STORYBOOK_HREF } from '../../shared/pages'
import { ScopeDevice } from './device/ScopeDevice'

const USAGE_SNIPPET = `import { makeWave, makeFundamental, WavePumper } from '@ldlework/scope'

const wave = makeWave()
wave.fundamentals = [makeFundamental(440, 0.5)]  // freq, amp, phase

const pumper = new WavePumper(500_000)  // beamHz
const sample = pumper.step(wave, { t, dt })
// sample: BeamPosition — { x, y, on?, beamI?, beamWidth? }`

export function App() {
  return (
    <div className="site">
      <Hero />
      <InstallSection />
      <DemoSection />
      <InTheBoxSection />
      <Footer />
    </div>
  )
}

function Hero() {
  return (
    <section className="site-section site-hero">
      <div className="site-container">
        <p className="site-eyebrow">scope</p>
        <h1 className="site-h1">Oscilloscope signal modeling.</h1>
        <p className="site-prose site-hero-desc">
          Oscilloscope-style synthetic-signal generation, plus a WebGL2
          deposit pass that feeds the resulting beam trace into{' '}
          <code>@ldlework/crt</code>'s phosphor pipeline. Scope is headless
          TypeScript: no React, no DOM. The demo below is a bench scope
          built on it.
        </p>
        <div className="site-links">
          <a href="https://www.npmjs.com/package/@ldlework/scope" target="_blank" rel="noreferrer">npm</a>
          <a href={GITHUB_HREF} target="_blank" rel="noreferrer">GitHub</a>
          <a href={STORYBOOK_HREF}>Storybook</a>
        </div>
      </div>
    </section>
  )
}

/* The bench scope, centred under a short hint. */
function DemoSection() {
  return (
    <section className="site-section" id="demo">
      <div className="site-container">
        <h2 className="site-h2">Demo</h2>
        <p className="site-prose site-demo-hint">
          Pick a shape, then turn the knobs. Time/div stretches the trace;
          trigger sets the level where each sweep starts.
        </p>
        <div className="scope-demo">
          <ScopeDevice />
        </div>
      </div>
    </section>
  )
}

function InTheBoxSection() {
  return (
    <section className="site-section" id="in-the-box">
      <div className="site-container site-container--narrow">
        <h2 className="site-h2">What's in the box</h2>
        <ul className="site-list">
          <li>
            <strong>Wave model</strong> — every wave is{' '}
            <code>Σᵢ ampᵢ·sin(2π·freqᵢ·t + phaseᵢ)</code> plus an always-on
            noise floor plus phase-locked bursts.
          </li>
          <li>
            <strong>WavePumper</strong> — the runtime. Walks a <code>Wave</code>{' '}
            at the configured beam sample rate and emits <code>BeamPosition</code>s
            (NDC x/y + per-sample beam character).
          </li>
          <li>
            <strong>Noise generators</strong> — white / brown / pink / drift,
            plus seeded variants for reproducible signal-floor noise.
          </li>
          <li>
            <strong>DepositPass + SegmentPump</strong> — the{' '}
            <code>@ldlework/crt</code> integration seam. <code>DepositPass</code>{' '}
            additively deposits beam segments via an analytical line-integral
            (woscope-style); <code>SegmentPump</code> batches a{' '}
            <code>BeamFn</code>'s per-frame samples into the instance data it
            consumes.
          </li>
        </ul>
      </div>
    </section>
  )
}

function InstallSection() {
  return (
    <section className="site-section" id="install">
      <div className="site-container site-container--narrow">
        <h2 className="site-h2">Install</h2>
        <CodeBlock lang="bash" code="pnpm add @ldlework/scope" />
        <p className="site-prose site-install-prose">
          The library is headless — model a wave, pump it, draw the
          samples however you like:
        </p>
        <CodeBlock lang="ts" code={USAGE_SNIPPET} />
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
        <a href="https://www.npmjs.com/package/@ldlework/scope" target="_blank" rel="noreferrer">npm</a>
      </div>
      <div>scope · MIT · @ldlework</div>
    </footer>
  )
}
