import { useId, type CSSProperties, type InputHTMLAttributes } from 'react'
import { logPosition, logValue } from './log-scale'

interface SliderProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'min' | 'max' | 'step' | 'onChange' | 'type' | 'disabled'
  > {
  value: number
  min: number
  max: number
  /**
   * Step in user units. Linear: the input's step, default
   * (max - min) / 1000. Log: the output value snaps to it (the knob
   * still moves smoothly); continuous when absent.
   */
  step?: number
  /**
   * Mapping between slider position and value. `linear` is direct;
   * `log` requires `min > 0` and maps slider position [0,1] to
   * value = exp(logMin + p * (logMax - logMin)). When the range is
   * not strictly positive, the component silently falls back to
   * linear so the input still works.
   */
  scale?: 'linear' | 'log'
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Recessed-groove range input. Renders a single `<input type="range">`
 * under the hood so keyboard / touch / accessibility come for free;
 * the visual is a recessed slot in chrome with a chrome-raised pill
 * thumb. Position-to-value mapping is internal — consumers always
 * see values in user units, never slider positions.
 */
export function Slider({
  value,
  min,
  max,
  step,
  scale = 'linear',
  onChange,
  disabled,
  className = '',
  style,
  ...rest
}: SliderProps) {
  const id = useId()
  const useLog = scale === 'log' && min > 0 && max > min
  const linStep = step ?? (max - min) / 1000

  if (useLog) {
    const pos = logPosition(value, min, max)
    return (
      <span
        className={`chrome-slider ${disabled ? 'is-disabled' : ''} ${className}`}
        style={style}
        data-scale="log"
      >
        <input
          {...rest}
          id={rest.id ?? id}
          type="range"
          min={0}
          max={1}
          step={1 / 1000}
          value={pos}
          disabled={disabled}
          onChange={(e) => onChange(logValue(Number(e.target.value), min, max, step))}
        />
      </span>
    )
  }

  return (
    <span
      className={`chrome-slider ${disabled ? 'is-disabled' : ''} ${className}`}
      style={style}
      data-scale="linear"
    >
      <input
        {...rest}
        id={rest.id ?? id}
        type="range"
        min={min}
        max={max}
        step={linStep}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </span>
  )
}

export type { SliderProps }
