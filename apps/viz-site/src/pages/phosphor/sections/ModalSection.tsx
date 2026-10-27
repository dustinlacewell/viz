import { useState } from 'react'
import { Display, Modal, Panel, PushButton } from '@ldlework/phosphor'
import { DemoRow } from '../components/DemoRow'
import { PANEL_CELL } from '../components/layout'

export function ModalSection() {
  return (
    <DemoRow
      id="modal"
      name="Modal"
      description="Backdrop, centered frame, Escape, click-outside. The dialog itself IS a Display; there is no extra modal chrome."
      demo={<ModalDemo />}
    />
  )
}

function ModalDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Panel
        style={{
          ...PANEL_CELL,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PushButton onClick={() => setOpen(true)}>Open dialog</PushButton>
      </Panel>
      <Modal open={open} onClose={() => setOpen(false)} ariaLabel="Confirm">
        <Display>
          {/* Title on glass — lit-pixel typography, no chip pretense. */}
          <div className="site-modal-title">Confirm action</div>
          <p className="site-modal-body">
            This is the on-glass dialog body. Backdrop click or
            Escape dismisses; or use the chips below.
          </p>
          <div className="screen-divider" />
          <div
            className="screen-chip-row"
            style={{ justifyContent: 'flex-end' }}
          >
            <button
              type="button"
              className="screen-chip"
              data-lit="false"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="screen-chip"
              data-lit="true"
              onClick={() => setOpen(false)}
            >
              Confirm
            </button>
          </div>
        </Display>
      </Modal>
    </>
  )
}
