import { HOME_PAGE, PACKAGE_PAGES, pageHref, type PageId, type SitePage } from './pages'

/** The site root, a slash, then one link per package: `viz / phosphor  dials  …`. */
export function SiteNav({ current }: { current: PageId }) {
  return (
    <nav className="site-nav" aria-label="Site">
      <NavLink page={HOME_PAGE} current={current} />
      <span className="site-nav-sep" aria-hidden="true">/</span>
      {PACKAGE_PAGES.map((page) => (
        <NavLink key={page.id} page={page} current={current} />
      ))}
    </nav>
  )
}

function NavLink({ page, current }: { page: SitePage; current: PageId }) {
  return (
    <a href={pageHref(page)} aria-current={page.id === current ? 'page' : undefined}>
      {page.label}
    </a>
  )
}
