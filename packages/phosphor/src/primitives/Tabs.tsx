import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { KeyBank } from './KeyBank'
import { PushButton } from './PushButton'
import { nextEnabledIndex } from './tabs-nav'

interface TabItem {
  key: string
  label: ReactNode
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  active: string
  onSelect: (key: string) => void
  className?: string
}

/**
 * Horizontal radio group of PushButtons, joined in a KeyBank. The
 * active tab renders with PushButton's `selected` state (the same
 * depressed-and-recolored treatment chrome buttons already use
 * everywhere); inactive tabs are
 * regular raised PushButtons. Reuses the existing chrome-button press
 * visuals so tabs feel mechanically identical to every other button
 * in the system.
 *
 * Keyboard follows the WAI-ARIA tabs pattern with automatic
 * activation: the list is one Tab stop (the active tab), ArrowLeft /
 * ArrowRight move to the previous / next enabled tab with wrap, Home /
 * End jump to the first / last enabled tab, and moving focus selects.
 * Composers wire tab keys to whatever content they render below.
 */
export function Tabs({ tabs, active, onSelect, className = '' }: TabsProps) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const disabled = tabs.map((t) => !!t.disabled)
  const stopIndex = tabStopIndex(tabs, active, disabled)

  const select = (i: number) => {
    const tab = tabs[i]
    if (!tab || tab.disabled) return
    if (tab.key !== active) onSelect(tab.key)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const target = targetIndex(e.key, disabled, i)
    if (target == null) return
    e.preventDefault()
    if (target < 0) return
    focusTab(listRef.current, target)
    select(target)
  }

  return (
    <KeyBank ref={listRef} role="tablist" className={`chrome-tabs ${className}`}>
      {tabs.map((tab, i) => {
        const isActive = tab.key === active
        return (
          <PushButton
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled || undefined}
            disabled={tab.disabled}
            selected={isActive}
            tabIndex={i === stopIndex ? 0 : -1}
            className="chrome-tab"
            onClick={() => select(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {tab.label}
          </PushButton>
        )
      })}
    </KeyBank>
  )
}

/**
 * The one tab that takes Tab focus: the active tab when it is enabled,
 * otherwise the first enabled tab.
 */
function tabStopIndex(
  tabs: ReadonlyArray<TabItem>,
  active: string,
  disabled: ReadonlyArray<boolean>,
): number {
  const i = tabs.findIndex((t) => t.key === active)
  if (i >= 0 && !disabled[i]) return i
  return nextEnabledIndex(disabled, -1, 1)
}

/**
 * Target tab for a navigation key, or null when the key is not a
 * navigation key. -1 means a navigation key with no enabled target.
 */
function targetIndex(
  key: string,
  disabled: ReadonlyArray<boolean>,
  from: number,
): number | null {
  switch (key) {
    case 'ArrowRight':
      return nextEnabledIndex(disabled, from, 1)
    case 'ArrowLeft':
      return nextEnabledIndex(disabled, from, -1)
    case 'Home':
      return nextEnabledIndex(disabled, -1, 1)
    case 'End':
      return nextEnabledIndex(disabled, disabled.length, -1)
    default:
      return null
  }
}

function focusTab(list: HTMLDivElement | null, i: number) {
  list?.querySelectorAll<HTMLElement>('[role="tab"]')[i]?.focus()
}

export type { TabsProps, TabItem }
