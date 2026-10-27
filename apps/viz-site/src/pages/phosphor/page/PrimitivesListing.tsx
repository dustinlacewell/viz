import type { ReactNode } from 'react'

/** The component listing: a heading, one line of intro, then one
 *  DemoRow per component section. */
export function PrimitivesListing({ children }: { children: ReactNode }) {
  return (
    <section className="site-section" id="primitives">
      <div className="site-container">
        <h2 className="site-h2">Primitives</h2>
        <p className="site-prose" style={{ marginBottom: 16 }}>
          The chassis-and-glass vocabulary, one component per row.
          They compose freely — drop any one inside any other.
        </p>
        {children}
      </div>
    </section>
  )
}
