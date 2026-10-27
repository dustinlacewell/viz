import { NAV_PAGES, pageHref, type PageId } from './pages'
import './site-nav.css'

export function SiteNav({ current }: { current: PageId }) {
  return (
    <nav className="site-nav" aria-label="Site">
      {NAV_PAGES.map((page) => (
        <a
          key={page.id}
          href={pageHref(page)}
          aria-current={page.id === current ? 'page' : undefined}
        >
          {page.label}
        </a>
      ))}
    </nav>
  )
}
