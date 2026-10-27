/* Shared layout constants for the demo cells on the phosphor page. */

/* Inset between the glass edge and on-glass content, for a full-bleed
   (`padding={0}`) Display that pads its own controls. Matches the
   standard screen margin. */
export const SCREEN_INSET = 16

/* Glass laid out as a flex column, so on-glass content can claim the
   height a `fill` Display gives it. */
export const GLASS_COLUMN = { display: 'flex', flexDirection: 'column' } as const

/* Sizes a Display or Panel to the whole demo cell. A Display also
   needs `fill` so its bezel + glass stretch to match. */
export const FILL_CELL = { width: '100%', height: '100%', boxSizing: 'border-box' } as const

/* A Display that hugs its content, centred in the demo cell. The
   cell's grid would otherwise stretch the chassis and leave the
   glass content-height. */
export const HUG_CELL = { alignSelf: 'center', justifySelf: 'center' } as const

/* A Panel that fills its demo cell with equal 20px padding. Demos
   spread this and add their own flex layout. */
export const PANEL_CELL = { ...FILL_CELL, padding: 20 } as const

/* Panel content as a column of control groups, spaced evenly down
   the cell height. */
export const PANEL_COLUMN = {
  ...PANEL_CELL,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  gap: 16,
} as const

/* Panel content as a row of control groups, spaced evenly across the
   cell width, bottoms aligned. */
export const PANEL_ROW = {
  ...PANEL_CELL,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-evenly',
  gap: 20,
} as const
