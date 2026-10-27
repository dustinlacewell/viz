import { useId, useState, type CSSProperties, type InputHTMLAttributes } from 'react'
import { commitDraft, liveDraftValue } from './number-draft'

interface NumberFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'min' | 'max' | 'step' | 'onChange' | 'type' | 'disabled'
  > {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  /** Optional explicit box width. Accepts a CSS length string or px number. */
  width?: number | string
  className?: string
  style?: CSSProperties
}

/**
 * Numeric input rendered as a chrome-bezeled mini-display — a
 * recessed dark slot with a glowing digital readout. Uses
 * <input type="number"> for native increment / decimal / paste
 * behaviour; the visual is the same family as SegmentedDisplay's
 * embedded screen but with editable text.
 *
 * Typing emits only finite numbers inside [min, max]. Other text
 * stays local until blur or Enter, which clamps a number to the range
 * or reverts anything else to `value`.
 */
export function NumberField({
  value,
  min,
  max,
  step,
  onChange,
  disabled,
  width,
  className = '',
  style,
  onBlur,
  onKeyDown,
  ...rest
}: NumberFieldProps) {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const mergedStyle: CSSProperties = {
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...style,
  }
  const shown = draft ?? (Number.isFinite(value) ? String(value) : '')

  const commit = () => {
    if (draft === null) return
    const next = commitDraft(draft, value, min, max)
    if (next !== value) onChange(next)
    setDraft(null)
  }

  return (
    <span
      className={`chrome-numberfield ${disabled ? 'is-disabled' : ''} ${className}`}
      style={mergedStyle}
    >
      <input
        {...rest}
        id={rest.id ?? id}
        type="number"
        value={shown}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => {
          setDraft(e.target.value)
          const v = liveDraftValue(e.target.value, min, max)
          if (v !== null) onChange(v)
        }}
        onBlur={(e) => {
          commit()
          onBlur?.(e)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          onKeyDown?.(e)
        }}
      />
    </span>
  )
}

export type { NumberFieldProps }
