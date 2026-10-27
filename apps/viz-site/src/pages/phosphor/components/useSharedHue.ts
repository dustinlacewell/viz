import { useCallback, useEffect, useState } from 'react'

/**
 * Shared hue state. The single source of truth is the `--theme-hue`
 * CSS custom property on <html>; multiple HueStrip demos on the page
 * read and write it through this hook so they don't fight each other.
 * The subscribe step pulls the current value out of the cascade on
 * mount and again whenever any consumer sets it.
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
    const onChange = () => setHue(readHue())
    window.addEventListener(HUE_EVENT, onChange)
    return () => window.removeEventListener(HUE_EVENT, onChange)
  }, [])
  const set = useCallback((next: number) => {
    document.documentElement.style.setProperty('--theme-hue', String(next))
    window.dispatchEvent(new CustomEvent(HUE_EVENT))
  }, [])
  return [hue, set] as const
}
