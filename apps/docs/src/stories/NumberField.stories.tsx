import type { Meta, StoryObj } from '@storybook/react'
import { useState, type ReactNode } from 'react'
import { NumberField, Panel, type NumberFieldProps } from '@ldlework/phosphor'

/**
 * A number you can type, in a small dark slot with a lit readout. It
 * has no spinner and no label of its own. Each story puts a caption
 * beside the field.
 */
const meta: Meta<typeof NumberField> = {
  title: 'Primitives/NumberField',
  component: NumberField,
}
export default meta

/**
 * The base field. Click it and type a number. Press the up or down
 * arrow key to step the value by 1.
 */
export const Default: StoryObj<typeof NumberField> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <Captioned label="freq hz">
        <HeldField initial={440} />
      </Captioned>
    </Panel>
  ),
}

/**
 * `step` sets how far the arrow keys move the value. Click the field,
 * then press the up or down arrow key. Each press moves 0.05.
 */
export const Step: StoryObj<typeof NumberField> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <Captioned label="gain">
        <HeldField initial={0.5} step={0.05} />
      </Captioned>
    </Panel>
  ),
}

/**
 * `min` and `max` bound the arrow keys. Click the field, then hold the
 * up or down arrow key. The value stops at 1 and at 16. A typed value
 * is not limited.
 */
export const MinMax: StoryObj<typeof NumberField> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <Captioned label="voices">
        <HeldField initial={4} min={1} max={16} />
      </Captioned>
    </Panel>
  ),
}

/**
 * `width` sets the box width, in px or as a CSS length. Top: no
 * `width`, so the field takes the browser's default input width.
 * Bottom: `width={64}`.
 */
export const Width: StoryObj<typeof NumberField> = {
  render: () => (
    <Panel style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
      <Captioned label="default">
        <HeldField initial={120} />
      </Captioned>
      <Captioned label="width 64">
        <HeldField initial={120} width={64} />
      </Captioned>
    </Panel>
  ),
}

/**
 * `disabled` dims the field and blocks it. Click it and try to type.
 * The value does not change.
 */
export const Disabled: StoryObj<typeof NumberField> = {
  render: () => (
    <Panel style={{ padding: 20 }}>
      <Captioned label="voices">
        <NumberField value={8} onChange={() => {}} disabled />
      </Captioned>
    </Panel>
  ),
}

/** A field that holds its own value. */
function HeldField({
  initial,
  ...props
}: Omit<NumberFieldProps, 'value' | 'onChange'> & { initial: number }) {
  const [v, setV] = useState(initial)
  return <NumberField {...props} value={v} onChange={setV} />
}

/** An embossed caption to the left of the field. */
function Captioned({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span className="chrome-emboss" style={{ fontSize: 12 }}>
        {label}
      </span>
      {children}
    </div>
  )
}
