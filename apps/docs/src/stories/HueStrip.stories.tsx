import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { HueStrip, Panel } from '@ldlework/phosphor'

const meta: Meta<typeof HueStrip> = {
  title: 'Primitives/HueStrip',
  component: HueStrip,
}
export default meta

const THEME_HUE = 82

/**
 * A hue slider. The strip only reports the hue. This story writes it
 * to the page's `--theme-hue`, so the panel and every other chrome
 * part take the new hue. Drag along the strip, or click a point on it.
 * Or click the strip, then press the left and right arrows for 1°
 * steps, or Page Up and Page Down for 10° steps.
 */
export const Default: StoryObj<typeof HueStrip> = {
  render: function Render() {
    const [hue, setHue] = useState(THEME_HUE)
    useThemeHue(hue)
    return (
      <Panel style={{ padding: 20, width: 360 }}>
        <HueStrip hue={hue} onChange={setHue} />
      </Panel>
    )
  },
}

/** Write `hue` to the page's `--theme-hue`; put the default back on unmount. */
function useThemeHue(hue: number) {
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-hue', String(hue))
  }, [hue])
  useEffect(
    () => () => {
      document.documentElement.style.removeProperty('--theme-hue')
    },
    [],
  )
}
