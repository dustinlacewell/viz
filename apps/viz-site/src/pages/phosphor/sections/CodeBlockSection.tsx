import { CodeBlock } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'

export function CodeBlockSection() {
  return (
    <DemoRow
      id="codeblock"
      name="CodeBlock"
      description="A recessed-glass syntax-highlighted source panel. Every token color is a CSS variable that tracks the theme hue — the code re-skins live along with the rest of the chassis."
      demo={<CodeBlockDemo />}
    />
  )
}

/* CodeBlock demo — show the primitive highlighting a small but
   real-looking JSX snippet. The point is to demonstrate the live
   hue tracking (drag the HueStrip and the keywords/strings/comments
   re-tint along with the chassis), so the content is incidental —
   any plausible composition works. */
const CODEBLOCK_DEMO_SOURCE = `export function PowerStrip({ on, onToggle }) {
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

function CodeBlockDemo() {
  // CodeBlock brings its own chrome chassis (chrome plate + OLED
  // bezel), so the demo cell hosts it bare — no Panel wrapper. The
  // primitive is meant to read as a piece of hardware on whatever
  // background it sits on.
  return (
    <CodeBlock
      lang="tsx"
      code={CODEBLOCK_DEMO_SOURCE}
      style={{ width: '100%', minWidth: 0 }}
    />
  )
}
