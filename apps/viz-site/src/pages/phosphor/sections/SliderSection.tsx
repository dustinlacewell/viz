import { useState } from 'react'
import { Panel, Slider } from '@ldlework/phosphor'
import { Captioned } from '../components/Captioned'
import { DemoRow } from '../components/DemoRow'
import { PANEL_COLUMN } from '../components/layout'

export function SliderSection() {
  return (
    <DemoRow
      id="slider"
      name="Slider"
      description="A chrome thumb in a recessed groove. Drag it, or click the groove to jump. Transpose moves in whole steps; freq moves on a log scale, so the low end is as easy to set as the high end."
      demo={<SliderDemo />}
    />
  )
}

function SliderDemo() {
  const [level, setLevel] = useState(0.5)
  const [transpose, setTranspose] = useState(0)
  const [freq, setFreq] = useState(600)
  return (
    <Panel style={PANEL_COLUMN}>
      <Captioned label="level" readout={level.toFixed(2)}>
        <Slider value={level} min={0} max={1} onChange={setLevel} />
      </Captioned>
      <Captioned label="transpose" readout={transpose > 0 ? `+${transpose}` : `${transpose}`}>
        <Slider value={transpose} min={-12} max={12} step={1} onChange={setTranspose} />
      </Captioned>
      <Captioned label="freq" readout={`${Math.round(freq)} Hz`}>
        <Slider value={freq} min={50} max={3000} scale="log" onChange={setFreq} />
      </Captioned>
    </Panel>
  )
}
