export type PageId =
  | 'home'
  | 'phosphor'
  | 'dials'
  | 'phosphor-dials'
  | 'crt'
  | 'scope'

export interface SitePage {
  readonly id: PageId
  readonly label: string
  /** Path under the Vite base, no leading slash. Empty for home. */
  readonly path: string
}

export interface PackagePage extends SitePage {
  readonly description: string
}

export const HOME_PAGE: SitePage = { id: 'home', label: 'viz', path: '' }

export const PACKAGE_PAGES: readonly PackagePage[] = [
  {
    id: 'phosphor',
    label: 'phosphor',
    path: 'phosphor/',
    description: 'A React design system in the shape of high-end audio.',
  },
  {
    id: 'dials',
    label: 'dials',
    path: 'dials/',
    description:
      'A parameter machine: dials driven by nested modulation sources, recursively.',
  },
  {
    id: 'phosphor-dials',
    label: 'phosphor-dials',
    path: 'phosphor-dials/',
    description: 'Dials in the phosphor design language.',
  },
  {
    id: 'crt',
    label: 'crt',
    path: 'crt/',
    description: 'A physically-grounded CRT phosphor display renderer for WebGL2.',
  },
  {
    id: 'scope',
    label: 'scope',
    path: 'scope/',
    description: 'Oscilloscope-style synthetic-signal generation for the crt beam.',
  },
]

export const NAV_PAGES: readonly SitePage[] = [HOME_PAGE, ...PACKAGE_PAGES]

export function pageHref(page: SitePage): string {
  return `${import.meta.env.BASE_URL}${page.path}`
}

/**
 * The phosphor Storybook. The deploy build copies it to `storybook/`;
 * in dev it runs on its own server (`wm storybook`).
 */
export const STORYBOOK_HREF = import.meta.env.DEV
  ? 'http://localhost:6006/'
  : `${import.meta.env.BASE_URL}storybook/`
