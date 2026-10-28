# @ldlework/phosphor

A React design system in the shape of late-80s / early-90s high-end audio
equipment: milled chrome chassis with raised plates, recessed OLED glass,
emitted-light pixel typography, a single-hue theme knob.

## Install

```bash
pnpm add @ldlework/phosphor
```

## Use

```tsx
import '@ldlework/phosphor/styles.css'
import { Display, PushButton, Panel } from '@ldlework/phosphor'

export function Example() {
  return (
    <Panel style={{ padding: 16 }}>
      <Display>
        <span className="screen-chip" data-lit="true">
          ON AIR
        </span>
      </Display>
      <PushButton>Engage</PushButton>
    </Panel>
  )
}
```

## Theming

One CSS variable drives the whole palette:

```css
:root { --theme-hue: 248; /* try 30 (amber), 145 (green), 320 (magenta) */ }
```

Colour math is OKLCH so perceptual brightness stays constant across hues.

## Primitives

- `Panel` — raised chrome plate (the chassis everything else mounts on)
- `Display` — dark OLED glass. Raised on its own chrome chassis by default, or
  recessed into a `Panel` (`raised={false}`). Black bezel ring on by default
  (`bezel={false}` for a single chamfer). Padding is the standard 16px screen
  margin; `padding={0}` is full-bleed. Also `color`, `fill`, `cursor`,
  `screenStyle`, `screenClassName`.
- `PushButton` — three-layer pushable button
- `KeyBank` — row of PushButtons joined edge to edge, like tape-deck keys
- `Modal` — backdrop + frame, designed to host a `Display` as the dialog
- `LeverSwitch` — two-position 3D rocker
- `SegmentedDisplay` — small recessed glass (`.screen-embedded`) with DSEG7 segmented digits
- `SegmentedSurface` — the glass and glow of `SegmentedDisplay`, holding any markup
- `ScrubChipRow` — horizontal screen-chip row with drag-to-scrub selection
- `ChipToggle` — on-screen lit/unlit chip
- `IndexStrip` — row of numbered chips on glass, with chrome action tiles
- `HueStrip` — 360° OKLCH hue picker on `.screen-embedded` glass
- `CodeBlock` — recessed code panel with theme-tracking syntax highlighting
- `Knob` — rotary knob with an optional baseline, modulation band and glide bar
- `ArcGauge` — small draggable arc with a readout
- `Slider` — linear or log slider on a recessed track
- `NumberField` — recessed numeric field; clamps to `min`/`max` on commit
- `Dropdown` — chrome select
- `Tabs` — tab row in a `KeyBank`, with arrow-key navigation
- `IconPicker` — glyph key that opens a grid of options, with hover cards
- `HelpTooltip` — "?" dot with a hover/focus popover
- `SidePanel` — panel docked to a window edge, slid in and out by its tab
- `useScreenPointer` — the mouse on the enclosing `Display` (with `cursor`),
  for content that draws its own pointer
