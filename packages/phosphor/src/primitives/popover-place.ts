/*
 * Placement math for body-portaled popovers (HelpTooltip, IconPicker).
 *
 * Pure: the trigger's viewport rect, the popover's size, and the
 * viewport size in; a `position: fixed` top/left out. The popover hangs
 * below the trigger, flipping above when it would run past the bottom
 * edge and there is room above. Horizontally it aligns to the trigger
 * (right edges, or centered) and clamps inside the viewport margin.
 */

export interface PlaceRect {
  top: number
  bottom: number
  left: number
  right: number
}

export interface PlaceSize {
  width: number
  height: number
}

/** `'end'`: right edges aligned. `'center'`: centered on the trigger. */
export type PopoverAlign = 'end' | 'center'

export interface PlaceOptions {
  align?: PopoverAlign | undefined
  /** Space between trigger and popover. */
  gap: number
  /** Minimum space between popover and viewport edge. */
  margin: number
}

export interface PopoverPlacement {
  top: number
  left: number
  /** Did we end up flipping to render above the trigger? */
  above: boolean
}

export function placePopover(
  trigger: PlaceRect,
  size: PlaceSize,
  viewport: PlaceSize,
  { align = 'end', gap, margin }: PlaceOptions,
): PopoverPlacement {
  const belowTop = trigger.bottom + gap
  const wantsAbove = belowTop + size.height + margin > viewport.height
  const above = wantsAbove && trigger.top - gap - size.height > margin
  const top = above ? trigger.top - gap - size.height : belowTop

  let left =
    align === 'center'
      ? (trigger.left + trigger.right) / 2 - size.width / 2
      : trigger.right - size.width
  if (left < margin) left = margin
  if (left + size.width > viewport.width - margin) {
    left = viewport.width - margin - size.width
  }

  return { top, left, above }
}
