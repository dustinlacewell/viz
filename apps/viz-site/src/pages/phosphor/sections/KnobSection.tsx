import { useState } from 'react'
import { Knob, Panel } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_ROW } from '../components/layout'

export function KnobSection() {
  return (
    <DemoRow
      id="knob"
      name="Knob"
      description="A rotary dial for one value. Drag up or down to turn it; double-click resets. Right-drag pan to widen its modulation band; Shift + right-drag amp to set its glide bar."
      demo={<KnobDemo />}
    />
  )
}

function KnobDemo() {
  const [freq, setFreq] = useState(600)
  const [transpose, setTranspose] = useState(0)
  const [pan, setPan] = useState(0)
  const [depth, setDepth] = useState(0.3)
  const [amp, setAmp] = useState(0.5)
  const [glide, setGlide] = useState(0.6)
  return (
    <Panel style={PANEL_ROW}>
      <Knob
        value={freq}
        baseline={freq}
        range={[50, 3000]}
        scale="log"
        defaultValue={600}
        label="freq"
        unit="hz"
        onChangeBaseline={setFreq}
      />
      <Knob
        value={transpose}
        baseline={transpose}
        range={[-12, 12]}
        step={1}
        defaultValue={0}
        label="transpose"
        format={(x) => (x > 0 ? `+${x}` : `${x}`)}
        onChangeBaseline={setTranspose}
      />
      <Knob
        value={pan}
        baseline={pan}
        range={[-1, 1]}
        depth={depth}
        onChangeDepth={setDepth}
        defaultValue={0}
        label="pan"
        onChangeBaseline={setPan}
      />
      <Knob
        value={amp}
        baseline={amp}
        range={[0, 1]}
        glide={glide}
        onChangeGlide={setGlide}
        defaultValue={0.5}
        label="amp"
        onChangeBaseline={setAmp}
      />
    </Panel>
  )
}
