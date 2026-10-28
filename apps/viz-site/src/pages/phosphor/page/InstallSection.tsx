import { CodeBlock } from '@ldlework/phosphor'

const INSTALL_SOURCE = 'pnpm add @ldlework/phosphor'

const USAGE_SOURCE = `import '@ldlework/phosphor/styles.css'
import { Display } from '@ldlework/phosphor'

export function Example() {
  return (
    <Display>
      <span className="screen-chip" data-lit="true">
        ON AIR
      </span>
    </Display>
  )
}`

const THEME_SOURCE = `:root { --theme-hue: 30; }   /* amber */
:root { --theme-hue: 145; }  /* phosphor green */
:root { --theme-hue: 320; }  /* magenta */`

export function InstallSection() {
  return (
    <section className="site-section" id="install">
      <div className="site-container site-container--narrow">
        <h2 className="site-h2">Install</h2>

        <CodeBlock lang="bash" code={INSTALL_SOURCE} />

        <p className="site-prose" style={{ marginTop: 16 }}>
          Import the stylesheet once, then use the primitives anywhere:
        </p>

        <CodeBlock lang="tsx" code={USAGE_SOURCE} />

        <h3 className="site-h3" style={{ marginTop: 24 }}>Theming</h3>
        <p className="site-prose">
          One CSS variable drives the whole palette. Set <code>--theme-hue</code> on
          <code>:root</code> (or anywhere down-tree to scope it) and every chrome
          primitive re-skins in OKLCH. Perceptual brightness stays roughly
          constant across hues, so the visual hierarchy holds.
        </p>
        <CodeBlock lang="css" code={THEME_SOURCE} />
      </div>
    </section>
  )
}
