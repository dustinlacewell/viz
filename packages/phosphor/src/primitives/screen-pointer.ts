/** Where the mouse is on a screen, in the screen's own layout pixels. */
export interface ScreenPointerSample {
  x: number
  y: number
  /** The screen's layout size, so readers can normalise `x` and `y`. */
  width: number
  height: number
}

/**
 * A screen's shared mouse position, as its children see it. A child
 * that draws the cursor itself (a CRT) claims it; the lit CSS pointer
 * hides while any claim is held.
 */
export interface ScreenPointer {
  /** The latest sample, or null while the mouse is off the glass. */
  get(): ScreenPointerSample | null
  /** True while at least one child holds a claim. */
  claimed(): boolean
  /** Take over drawing the cursor. Returns the release. */
  claim(): () => void
  /** Called after every sample or claim change. Returns the unsubscribe. */
  subscribe(listener: () => void): () => void
}

/** The screen's side of the store: it also writes samples. */
export interface ScreenPointerSource extends ScreenPointer {
  set(sample: ScreenPointerSample | null): void
}

export function createScreenPointer(): ScreenPointerSource {
  let sample: ScreenPointerSample | null = null
  let claims = 0
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  return {
    get: () => sample,
    claimed: () => claims > 0,
    set(next) {
      sample = next
      notify()
    },
    claim() {
      claims++
      notify()
      let held = true
      return () => {
        if (!held) return
        held = false
        claims--
        notify()
      }
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
