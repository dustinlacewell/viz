import type { ReactNode } from 'react'
import { Display } from '@ldlework/phosphor'
import { HeroScope } from './scope'
import './scope-hero.css'

interface ScopeHeroProps {
  wordmark: string
  tagline: ReactNode
  /** Content of the call-to-action row under the tagline. */
  children?: ReactNode
  noTuning?: boolean
}

/** CRT display with a live scope trace, a wordmark, a tagline and a CTA row. */
export function ScopeHero({ wordmark, tagline, children, noTuning }: ScopeHeroProps) {
  return (
    <section className="site-hero">
      <div className="site-hero-stage">
        <Display style={{ width: '100%' }}>
          <div className="site-hero-screen">
            <div className="site-hero-scope" aria-hidden>
              <HeroScope noTuning={noTuning} />
            </div>
            <div className="site-hero-wordmark">{wordmark}</div>
            <div className="site-hero-tagline">{tagline}</div>
            {children && <div className="site-hero-cta">{children}</div>}
          </div>
        </Display>
      </div>
    </section>
  )
}
