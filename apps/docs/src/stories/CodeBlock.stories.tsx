import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { CodeBlock, HueStrip, Panel } from '@ldlework/phosphor'

const meta: Meta<typeof CodeBlock> = {
  title: 'Primitives/CodeBlock',
  component: CodeBlock,
}
export default meta

const TSX_EXAMPLE = `import { Display, ChipToggle } from '@ldlework/phosphor'

export function PowerStrip({ on, onToggle }) {
  // The chip is width-stable so the row never resizes.
  return (
    <Display>
      <ChipToggle
        value={on}
        onChange={onToggle}
        onLabel="LIVE"
        offLabel="STANDBY"
      />
    </Display>
  )
}`

const CSS_EXAMPLE = `/* The whole palette derives from one variable. */
:root {
  --theme-hue: 145; /* phosphor green */
}

.chrome-emboss {
  color: var(--chrome-button-label);
  text-shadow: var(--chrome-text-emboss);
}`

const BASH_EXAMPLE = `pnpm add @ldlework/phosphor`

/**
 * Highlighted source on its own screen. Look at the token colors:
 * keywords, strings, tags and comments each take a different shade of
 * the theme hue.
 */
export const Default: StoryObj<typeof CodeBlock> = {
  render: () => <CodeBlock lang="tsx" code={TSX_EXAMPLE} style={{ width: 520 }} />,
}

/**
 * `lang` picks the grammar. Top: `css`, with selectors and property
 * names. Bottom: `bash`, a one-line install command.
 */
export const Lang: StoryObj<typeof CodeBlock> = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 520 }}>
      <CodeBlock lang="css" code={CSS_EXAMPLE} />
      <CodeBlock lang="bash" code={BASH_EXAMPLE} />
    </div>
  ),
}

const THEME_HUE = 82

/**
 * Every token color derives from `--theme-hue`. The HueStrip here
 * writes that variable for the page. Drag along the strip: the code
 * re-tints with the chrome.
 */
export const HueTracking: StoryObj<typeof CodeBlock> = {
  render: function Render() {
    const [hue, setHue] = useState(THEME_HUE)
    useEffect(() => {
      document.documentElement.style.setProperty('--theme-hue', String(hue))
    }, [hue])
    useEffect(
      () => () => {
        document.documentElement.style.removeProperty('--theme-hue')
      },
      [],
    )
    return (
      <Panel style={{ padding: 20, width: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CodeBlock lang="tsx" code={TSX_EXAMPLE} />
        <HueStrip hue={hue} onChange={setHue} />
      </Panel>
    )
  },
}
