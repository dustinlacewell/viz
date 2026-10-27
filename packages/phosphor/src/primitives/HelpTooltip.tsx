/*
 * .chrome-help — small chrome-engraved "?" dot with a hover/focus popover.
 *
 * The popover is portaled to document.body so it can escape any
 * `overflow: hidden / auto` ancestor (e.g. a side panel's scroll body).
 * Position is computed from the trigger's bounding rect; if there's not
 * enough room below the trigger, the popover flips to above. Horizontal
 * position clamps so the popover never overflows the viewport.
 */

import { useEffect, useId, useRef, useState, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { placePopover, type PopoverPlacement } from './popover-place'

interface HelpTooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'title'> {
  title: string
  description: string
  className?: string
}

const POPOVER_WIDTH = 240
const VIEWPORT_MARGIN = 6
const TRIGGER_GAP = 6

export function HelpTooltip({
  title,
  description,
  className = '',
  ...rest
}: HelpTooltipProps) {
  const popoverId = useId()
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<PopoverPlacement | null>(null)

  // Recompute position whenever we open. Also reposition on scroll /
  // resize while open so the popover follows its trigger.
  useEffect(() => {
    if (!open) return
    const place = () => {
      const t = triggerRef.current
      if (!t) return
      setPos(computePosition(t.getBoundingClientRect()))
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  return (
    <>
      <span
        {...rest}
        ref={triggerRef}
        className={`chrome-help ${className}`}
        tabIndex={0}
        role="button"
        aria-label={`About ${title}`}
        aria-describedby={open ? popoverId : undefined}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className="chrome-help-glyph" aria-hidden="true">?</span>
      </span>
      {open && pos
        ? createPortal(
            <div
              id={popoverId}
              role="tooltip"
              className="chrome-help-popover"
              data-placement={pos.above ? 'above' : 'below'}
              style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
            >
              <strong>{title}</strong>
              <span>{description}</span>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

/**
 * Below the trigger, flipping above near the bottom edge; right edges
 * aligned (keeps the help icon visually "tethered" to its tooltip),
 * clamped to the viewport.
 */
function computePosition(trigger: DOMRect): PopoverPlacement {
  // The actual popover height isn't known yet — we estimate ~5 lines
  // worth (~100px) for the flip decision. Once rendered, browser
  // clipping handles any remaining overflow.
  const estimatedH = 100
  return placePopover(
    trigger,
    { width: POPOVER_WIDTH, height: estimatedH },
    { width: window.innerWidth, height: window.innerHeight },
    { gap: TRIGGER_GAP, margin: VIEWPORT_MARGIN },
  )
}

export type { HelpTooltipProps }
