import { useEffect, useState } from 'react'
import {
  ChipToggle,
  HueStrip,
  Modal,
  Display,
  PushButton,
} from '@ldlework/phosphor'

type TabKey = 'display' | 'theme'
const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: 'display', label: 'Display' },
  { key: 'theme', label: 'Theme' },
]

/**
 * Settings modal showcase. A Display brings its own chassis; the
 * Theme tab mounts a recessed-glass HueStrip on its footer strip.
 */
export function SettingsModalShowcase() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<TabKey>('display')
  const [fullscreen, setFullscreen] = useState(false)
  const [hue, setHue] = useState(82)

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-hue', String(hue))
  }, [hue])

  return (
    <>
      <PushButton onClick={() => setOpen(true)}>Settings</PushButton>
      <Modal open={open} onClose={() => setOpen(false)} ariaLabel="Settings">
        <Display
          padding={16}
          footer={active === 'theme' && <HueStrip hue={hue} onChange={setHue} />}
        >
            <div className="screen-chip-row">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className="screen-chip"
                  data-lit={t.key === active ? 'true' : 'false'}
                  onClick={() => setActive(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="screen-divider" />

            <div className="screen-rows" style={{ minHeight: 80 }}>
              {active === 'display' && (
                <div className="screen-row">
                  <span className="screen-row-label">Fullscreen</span>
                  <ChipToggle
                    value={fullscreen}
                    onChange={setFullscreen}
                    onLabel="ON"
                    offLabel="OFF"
                  />
                </div>
              )}
              {active === 'theme' && (
                <div className="screen-row">
                  <span className="screen-row-label">Hue</span>
                  <span className="screen-row-readout">
                    H {Math.round(hue).toString().padStart(3, '0')}°
                  </span>
                </div>
              )}
            </div>
        </Display>
      </Modal>
    </>
  )
}
