import { useRef, type ReactNode } from 'react'
import { useOffscreenMark } from './offscreen'

interface DemoRowProps {
  /** Component name — rendered as the section heading. */
  name: string
  /** One-sentence description. */
  description: string
  /** The live demo. */
  demo: ReactNode
  /** Optional id for anchor linking. */
  id?: string
}

/**
 * One row of the component listing — live demo on one side, prose on
 * the other. The order flips per row (site.css, by row position) so
 * the eye zig-zags down the page. Source examples live in Storybook
 * (one source of truth), not on the marketing site.
 */
export function DemoRow({ name, description, demo, id }: DemoRowProps) {
  const ref = useRef<HTMLDivElement>(null)
  useOffscreenMark(ref)
  return (
    <div ref={ref} className="site-row" id={id}>
      <div className="site-row-demo">{demo}</div>
      <div className="site-row-text">
        <h3 className="site-row-title">{name}</h3>
        <p className="site-prose">{description}</p>
      </div>
    </div>
  )
}
