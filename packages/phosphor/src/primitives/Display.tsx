import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { ScreenCursor } from './ScreenCursor'

type DivProps = HTMLAttributes<HTMLDivElement>

interface DisplayProps extends DivProps {
  /** The content displayed on the screen. */
  children: ReactNode
  /**
   * Sit on a raised chrome chassis of its own (default true). False:
   * recessed straight into the host chrome, e.g. a Panel, beside the
   * controls that drive it.
   */
  raised?: boolean
  /**
   * Frame the glass in the black bezel ring (default true). False: the
   * glass meets the chrome through a single chamfer — right for small
   * readouts.
   */
  bezel?: boolean
  /**
   * The screen's emitted color — any CSS color expression. Drives the
   * rim catch, body tint and spill of THIS screen (sets
   * `--display-color`). Omitted, the screen inherits the theme.
   */
  color?: string | undefined
  /**
   * Padding inside the glass, around `children`. Number is treated as
   * px; string is passed through verbatim (`'16px 24px'`, `'1rem'`).
   * Omitted, the glass uses the standard screen margin
   * (`--screen-inset`). Pass `0` for full-bleed content (oscilloscope,
   * CRT canvas).
   */
  padding?: number | string
  /**
   * Stretch the Display to fill its parent. When `true`, the root, the
   * bezel and the glass all claim `flex: 1` so the screen grows to
   * whatever height the parent flexbox provides. The default (`false`)
   * lets the Display size to its content.
   */
  fill?: boolean
  /**
   * Draw a lit pointer on the glass and hide the system cursor over
   * the screen. The drawn pointer copies the real mouse, so clicks
   * work unchanged. Off by default.
   */
  cursor?: boolean
  /**
   * Style overrides for the glass. Use for one-off adjustments not
   * covered by `padding` / `fill` (e.g. flex layout of on-glass
   * content). Doesn't affect the chassis or bezel.
   */
  screenStyle?: CSSProperties
  /** Extra className for the glass. */
  screenClassName?: string
}

/**
 * A dark luminous screen. Children should be emitted-light pixels
 * only (`.screen-row`, `.screen-chip`, `.screen-readout`, …) — nothing
 * physical goes on the glass; controls sit on the chrome around it.
 *
 * Two independent choices shape it:
 *   - `raised`: a chrome Lip chassis of its own, or recessed straight
 *     into the host chrome.
 *   - `bezel`: the glass framed in a black Bezel ring (`.bezel >
 *     .screen`), or meeting the chrome through its own chamfer
 *     (`.screen-embedded`).
 *
 * Root props (`className`, `style`, handlers, `color`) land on the
 * outermost element, whichever that is.
 */
export function Display({
  children,
  raised = true,
  bezel = true,
  color,
  padding,
  fill = false,
  cursor = false,
  screenStyle,
  screenClassName,
  ...root
}: DisplayProps) {
  const rootProps = withStyle(root, { ...colorVar(color), ...stretch(fill) })
  const glassProps: DivProps = {
    className: cx('display-glass', screenClassName),
    style: { ...inset(padding), ...stretch(fill), ...screenStyle },
  }
  const pane = (outer: DivProps) => (
    <Pane bezel={bezel} cursor={cursor} outer={outer} glass={glassProps}>
      {children}
    </Pane>
  )
  return raised ? <Lip {...rootProps}>{pane({ style: stretch(fill) })}</Lip> : pane(rootProps)
}

/** The raised chrome chassis: Lip class on the chrome-raised substrate. */
function Lip({ className, children, ...rest }: DivProps) {
  return (
    <div {...rest} className={cx('display lip chrome-raised', className)}>
      <span className="chrome-raised-shadow" aria-hidden="true" />
      <span className="chrome-raised-edge" aria-hidden="true" />
      <span className="chrome-raised-front" aria-hidden="true" />
      {children}
    </div>
  )
}

interface PaneProps {
  bezel: boolean
  cursor: boolean
  /** Props for the pane's outermost element: the bezel, or the bare glass. */
  outer: DivProps
  glass: DivProps
  children: ReactNode
}

/** The glass, framed in a Bezel ring or bare with its own chamfer. */
function Pane({ bezel, cursor, outer, glass, children }: PaneProps) {
  if (!bezel) {
    return (
      <Glass kind="screen-embedded" cursor={cursor} {...merge(glass, outer)}>
        {children}
      </Glass>
    )
  }
  return (
    <div {...outer} className={cx('bezel', outer.className)}>
      <Glass kind="screen" cursor={cursor} {...glass}>
        {children}
      </Glass>
    </div>
  )
}

interface GlassProps extends DivProps {
  kind: 'screen' | 'screen-embedded'
  cursor: boolean
}

/** The glass surface itself, with the cursor plumbing as its content. */
function Glass({ kind, cursor, className, children, ...rest }: GlassProps) {
  return (
    <div {...rest} className={cx(kind, className)}>
      <ScreenCursor enabled={cursor}>{children}</ScreenCursor>
    </div>
  )
}

const FILL: CSSProperties = { flex: 1 }

function stretch(fill: boolean): CSSProperties | undefined {
  return fill ? FILL : undefined
}

function inset(padding: number | string | undefined): CSSProperties | undefined {
  return padding !== undefined ? { padding } : undefined
}

function colorVar(color: string | undefined): CSSProperties | undefined {
  return color !== undefined ? { ['--display-color' as string]: color } : undefined
}

/** `props` with `base` styles under its own `style`. */
function withStyle(props: DivProps, base: CSSProperties): DivProps {
  return { ...props, style: { ...base, ...props.style } }
}

/** Two prop sets on one element: classes join, `over` wins on style and handlers. */
function merge(under: DivProps, over: DivProps): DivProps {
  return {
    ...under,
    ...over,
    className: cx(under.className, over.className),
    style: { ...under.style, ...over.style },
  }
}

function cx(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ')
}

export type { DisplayProps }
