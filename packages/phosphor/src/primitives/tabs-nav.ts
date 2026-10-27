/**
 * Index of the next enabled tab after `from`, walking by `step` and
 * wrapping at both ends. `from` may sit one past either end (-1 or
 * length) so Home/End can reuse the walk. Returns -1 when every tab
 * is disabled.
 */
export function nextEnabledIndex(
  disabled: ReadonlyArray<boolean>,
  from: number,
  step: 1 | -1,
): number {
  const n = disabled.length
  for (let i = 1; i <= n; i++) {
    const idx = (((from + step * i) % n) + n) % n
    if (!disabled[idx]) return idx
  }
  return -1
}
