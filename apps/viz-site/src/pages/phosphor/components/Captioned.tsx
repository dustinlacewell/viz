import type { ReactNode } from 'react'

/** An embossed label and readout above a chassis control. */
export function Captioned({
  label,
  readout,
  children,
}: {
  label: string
  readout: string
  children: ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="chrome-emboss site-caption">
        <span>{label}</span>
        <span>{readout}</span>
      </div>
      {children}
    </div>
  )
}
