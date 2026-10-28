import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

interface KeyBankProps extends HTMLAttributes<HTMLDivElement> {
  /** The keys: PushButtons, in order from left to right. */
  children: ReactNode
}

/**
 * A row of PushButtons joined into one block, like the mode keys on a
 * tape deck. The keys share their edges: no gap, square corners where
 * they meet, and one drop shadow for the whole bank. Each key keeps
 * its own press, select and disabled states.
 *
 * Renders `role="group"`; pass `role` to override it (Tabs passes
 * `role="tablist"`). The ref reaches the row element.
 *
 *   <KeyBank aria-label="Transport">
 *     <PushButton>Prev</PushButton>
 *     <PushButton selected>Play</PushButton>
 *     <PushButton>Next</PushButton>
 *   </KeyBank>
 */
export const KeyBank = forwardRef<HTMLDivElement, KeyBankProps>(function KeyBank(
  { children, className = '', role = 'group', ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} role={role} className={`chrome-keybank ${className}`}>
      {children}
    </div>
  )
})

export type { KeyBankProps }
