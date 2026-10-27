import { PACKAGE_PAGES, pageHref } from '../../shared/pages'
import { ScopeHero } from '../../shared/ScopeHero'

export function App() {
  return (
    <main>
      <ScopeHero
        wordmark="VIZ"
        noTuning
        tagline={
          <>
            Visual packages from{' '}
            <a
              href="https://ldlework.com"
              target="_blank"
              rel="noreferrer"
              className="scope-hero-tagline-link"
            >
              ldlework
            </a>
          </>
        }
      />
      <ul className="home-list">
        {PACKAGE_PAGES.map((page) => (
          <li key={page.id}>
            <a href={pageHref(page)}>{page.label}</a>
            <span className="home-desc"> — {page.description}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
