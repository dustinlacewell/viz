import { Panel } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_CELL } from '../components/layout'

export function PanelSection() {
  return (
    <DemoRow
      id="panel"
      name="Panel"
      description="A raised chrome plate — the chassis everything else sits on. Sized by its container; group related controls inside one Panel so they read as a single unit. Labels are embossed into the plate with the chrome-emboss class."
      demo={<PanelDemo />}
    />
  )
}

/** The Panel demo is the plate and one embossed label. The point of
 *  the primitive is the chassis itself — the brushed plate, the
 *  rolled chamfer, the bottom catch-light — so nothing else sits on
 *  it. */
function PanelDemo() {
  return (
    <Panel style={PANEL_CELL}>
      <div className="chrome-emboss" style={{ fontSize: 14, letterSpacing: '0.15em' }}>
        DECK A
      </div>
    </Panel>
  )
}
