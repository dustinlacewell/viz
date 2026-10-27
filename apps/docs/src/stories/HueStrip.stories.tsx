import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { HueStrip, Panel, SegmentedDisplay } from '@ldlework/phosphor'

const meta: Meta<typeof HueStrip> = {
  title: 'Primitives/HueStrip',
  component: HueStrip,
}
export default meta

/**
 * The HueStrip drives the global `--theme-hue` CSS variable. Dragging
 * re-skins every chrome primitive across the whole page in real time
 * — open another primitive's story in a second tab while you drag.
 */
export const Default: StoryObj<typeof HueStrip> = {
  render: () => {
    const [hue, setHue] = useState(82)
    useEffect(() => {
      document.documentElement.style.setProperty('--theme-hue', String(hue))
    }, [hue])
    return (
      <Panel style={{ padding: 20, width: 360, display: 'flex', alignItems: 'center', gap: 14 }}>
        <SegmentedDisplay style={{ minWidth: '5ch' }}>
          {Math.round(hue).toString().padStart(3, '0')}
        </SegmentedDisplay>
        <div style={{ flex: 1 }}>
          <HueStrip hue={hue} onChange={setHue} />
        </div>
      </Panel>
    )
  },
}
