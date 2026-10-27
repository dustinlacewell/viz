/*
 * Rules for a numeric text field's draft text. Pure — no DOM.
 *
 *   - While typing, a draft emits a value only when it is a finite
 *     number inside [min, max]. Partial text ("", "-", ".", "-.") and
 *     out-of-range numbers stay local.
 *   - On commit (blur / Enter), a finite draft clamps to [min, max];
 *     any other draft reverts to the current value.
 */
export function parseDraft(text: string): number | null {
  if (text.trim() === '') return null
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

const inRange = (n: number, min?: number, max?: number) =>
  (min === undefined || n >= min) && (max === undefined || n <= max)

const clamp = (n: number, min?: number, max?: number) =>
  Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))

/** The value to emit while typing, or null to keep the draft local. */
export function liveDraftValue(text: string, min?: number, max?: number): number | null {
  const n = parseDraft(text)
  return n !== null && inRange(n, min, max) ? n : null
}

/** The value the field settles on when the draft commits. */
export function commitDraft(text: string, current: number, min?: number, max?: number): number {
  const n = parseDraft(text)
  return n === null ? current : clamp(n, min, max)
}
