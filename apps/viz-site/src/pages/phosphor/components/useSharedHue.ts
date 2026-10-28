import { useCallback, useEffect, useState } from 'react'

/**
 * Shared hue state. The single source of truth is the `--theme-hue`
 * CSS custom property on <html>; multiple HueStrip demos on the page
 * read and write it through this hook so they don't fight each other.
 * The cascade is read once, on mount. A change carries its value in
 * the event: reading the cascade back right after the write would
 * force a whole-page restyle inside every pointer move.
 */
const HUE_EVENT = 'phosphor:hue-change'
function readHue(): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--theme-hue')
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 82
}
export function useSharedHue() {
  const [hue, setHue] = useState<number>(() => (typeof document === 'undefined' ? 82 : readHue()))
  useEffect(() => {
    const onChange = (e: Event) => setHue((e as CustomEvent<number>).detail)
    window.addEventListener(HUE_EVENT, onChange)
    return () => window.removeEventListener(HUE_EVENT, onChange)
  }, [])
  const set = useCallback((next: number) => {
    document.documentElement.style.setProperty('--theme-hue', String(next))
    window.dispatchEvent(new CustomEvent(HUE_EVENT, { detail: next }))
  }, [])
  return [hue, set] as const
}
