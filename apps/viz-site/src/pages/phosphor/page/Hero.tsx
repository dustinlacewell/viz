import { WalkmanShowcase } from '@ldlework/walkman'
import { GITHUB_HREF, STORYBOOK_HREF } from '../../../shared/pages'

export function Hero() {
  return (
    <section className="site-section site-hero">
      <div className="site-container phosphor-hero-grid">
        <div className="phosphor-hero-text">
          <p className="site-eyebrow">phosphor</p>
          <h1 className="site-h1">A React design system.</h1>
          <p className="site-prose site-hero-desc">
            Components modeled after hi-fi gear: chrome panels, glass screens, push buttons. One CSS variable sets the
            hue of all of them.
          </p>
          <div className="site-links">
            <a href={GITHUB_HREF} target="_blank" rel="noreferrer">GitHub</a>
            <a href={STORYBOOK_HREF}>Storybook</a>
          </div>
        </div>
        <div className="phosphor-hero-demo">
          <WalkmanShowcase />
        </div>
      </div>
    </section>
  )
}
