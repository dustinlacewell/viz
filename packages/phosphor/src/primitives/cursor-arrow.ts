/**
 * The screen cursor's arrow, shared by the lit CSS pointer and any
 * renderer that draws the cursor itself. Units are CSS pixels. The
 * path's tip sits at (0, 0): that point is the hotspot.
 */
export const CURSOR_ARROW = {
  path: 'M0 0 L0 15 L4 11.5 L6.8 17.5 L9 16.5 L6.3 10.6 L11 10.6 Z',
  /** Room left of and above the path for its 1px stroke. */
  inset: 1,
  /** The arrow's box, stroke room included. */
  width: 14,
  height: 20,
} as const
