import { HueStrip, Panel, SegmentedDisplay } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { useSharedHue } from '../components/useSharedHue'

export function HueStripSection() {
  return (
    <DemoRow
      id="huestrip"
      name="HueStrip"
      description="A 360° OKLCH hue picker — a recessed-glass strip with the spectrum painted behind it. Drives the global theme variable so the whole page re-skins as you drag."
      demo={<HueStripDemo />}
    />
  )
}

/** Also used by the features block at the top of the page. */
export function HueStripDemo() {
  const [hue, setHue] = useSharedHue()
  return (
    <Panel
      style={{
        padding: 20,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <SegmentedDisplay style={{ minWidth: '5ch' }}>
        {Math.round(hue).toString().padStart(3, '0')}
      </SegmentedDisplay>
      <div style={{ flex: 1 }}>
        <HueStrip hue={hue} onChange={setHue} />
      </div>
    </Panel>
  )
}
