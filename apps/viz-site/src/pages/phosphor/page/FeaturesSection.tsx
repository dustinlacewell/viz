import { HueStripDemo } from '../sections/HueStripSection'

export function FeaturesSection() {
  return (
    <section className="site-section">
      <div className="site-container">
        <h2 className="site-h2 site-features-title">
          Retrofuturistic hi-fi, for the web.
        </h2>
        <div className="site-features-grid">
          <p className="site-prose">
            Phosphor is modeled after high-end stereo equipment — brushed
            chrome chassis, recessed glass OLED screens, skeuomorphic push
            buttons, and rims that catch edge-glow from the lit pixels
            inside. Everything tints from a single OKLCH hue, so you can
            re-skin the whole library by setting one CSS variable.
          </p>
          <HueStripDemo />
        </div>
      </div>
    </section>
  )
}
