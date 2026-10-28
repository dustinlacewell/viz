import { GITHUB_HREF, STORYBOOK_HREF } from '../../../shared/pages'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-links">
        <a href={GITHUB_HREF} target="_blank" rel="noreferrer">GitHub</a>
        <a href={STORYBOOK_HREF}>Storybook</a>
        <a href="https://www.npmjs.com/package/@ldlework/phosphor" target="_blank" rel="noreferrer">npm</a>
      </div>
      <div>Phosphor · MIT · @ldlework</div>
    </footer>
  )
}
