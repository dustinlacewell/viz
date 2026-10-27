import { CodeBlock } from '@ldlework/phosphor'
import exampleSource from './example.ts?raw'
import { sample } from './example'
import { SignalTrace } from './SignalTrace'

export function App() {
  return (
    <div className="site">
      <Hero />
      <DemoSection />
      <InstallSection />
      <Footer />
    </div>
  )
}

function Hero() {
  return (
    <section className="site-section site-hero">
      <div className="site-container">
        <p className="site-eyebrow">dials</p>
        <h1 className="site-h1">A parameter machine.</h1>
        <p className="site-prose site-hero-desc">
          Values you can modulate. Modulators can be modulated too, as deeply as you like. Read a value and you get a
          plain number.
        </p>
        <div className="site-links">
          <a href="https://www.npmjs.com/package/@ldlework/dials" target="_blank" rel="noreferrer">npm</a>
          <a href="https://github.com/ldlework/phosphor" target="_blank" rel="noreferrer">GitHub</a>
          <a href="./storybook/">Storybook</a>
        </div>
      </div>
    </section>
  )
}

function DemoSection() {
  return (
    <section className="site-section" id="demo">
      <div className="site-container site-container--narrow demo-stack">
        <h2 className="site-h2">Live demo</h2>
        <CodeBlock lang="ts" code={exampleSource} />
        <SignalTrace sample={sample} />
      </div>
    </section>
  )
}

function InstallSection() {
  return (
    <section className="site-section" id="install">
      <div className="site-container site-container--narrow">
        <h2 className="site-h2">Install</h2>
        <CodeBlock lang="bash" code="pnpm add @ldlework/dials" />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-links">
        <a href="https://github.com/ldlework/phosphor" target="_blank" rel="noreferrer">GitHub</a>
        <a href="./storybook/">Storybook</a>
        <a href="https://www.npmjs.com/package/@ldlework/dials" target="_blank" rel="noreferrer">npm</a>
      </div>
      <div>dials · MIT · @ldlework</div>
    </footer>
  )
}
