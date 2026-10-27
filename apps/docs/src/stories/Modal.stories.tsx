import type { Meta, StoryObj } from '@storybook/react'
import { useState, type ReactNode } from 'react'
import { ChipToggle, Display, Modal, Panel, PushButton } from '@ldlework/phosphor'

const meta: Meta<typeof Modal> = {
  title: 'Primitives/Modal',
  component: Modal,
}
export default meta

/** The chrome key that opens the dialog. */
function OpenKey({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <Panel style={{ padding: 20 }}>
      <PushButton onClick={onOpen}>{label}</PushButton>
    </Panel>
  )
}

/** A delete confirmation on the glass. Each chip closes the dialog. */
function ConfirmDelete({ onClose }: { onClose: () => void }): ReactNode {
  return (
    <Display>
      <div className="screen-row">
        <span className="screen-row-label">delete preset</span>
        <span className="screen-row-readout">Warm Pad</span>
      </div>
      <div className="screen-divider" />
      <div className="screen-chip-row">
        <ChipToggle value={false} onChange={onClose}>CANCEL</ChipToggle>
        <ChipToggle value={false} onChange={onClose}>DELETE</ChipToggle>
      </div>
    </Display>
  )
}

/**
 * The page dims and the Display in the middle is the dialog. Press
 * Save preset to open it. Press Escape or click the dim backdrop to
 * close it.
 */
export const Default: StoryObj<typeof Modal> = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <OpenKey label="Save preset" onOpen={() => setOpen(true)} />
        <Modal open={open} onClose={() => setOpen(false)} ariaLabel="Preset saved">
          <Display>
            <div className="screen-chip-row">
              <span className="screen-chip" data-lit="true">SAVED</span>
            </div>
            <div className="screen-row">
              <span className="screen-row-label">slot 07</span>
              <span className="screen-row-readout">Warm Pad</span>
            </div>
          </Display>
        </Modal>
      </>
    )
  },
}

/**
 * `dismissOnBackdrop={false}`: a click on the backdrop does nothing.
 * Press Delete preset to open it. Click the backdrop; the dialog
 * stays. Click CANCEL or DELETE, or press Escape, to close it.
 */
export const NoBackdropDismiss: StoryObj<typeof Modal> = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <OpenKey label="Delete preset" onOpen={() => setOpen(true)} />
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          dismissOnBackdrop={false}
          ariaLabel="Delete preset"
        >
          <ConfirmDelete onClose={() => setOpen(false)} />
        </Modal>
      </>
    )
  },
}

/**
 * `dismissOnEscape={false}`: the Escape key does nothing. Press Delete
 * preset to open it. Press Escape; the dialog stays. Click CANCEL or
 * DELETE, or click the backdrop, to close it.
 */
export const NoEscapeDismiss: StoryObj<typeof Modal> = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <OpenKey label="Delete preset" onOpen={() => setOpen(true)} />
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          dismissOnEscape={false}
          ariaLabel="Delete preset"
        >
          <ConfirmDelete onClose={() => setOpen(false)} />
        </Modal>
      </>
    )
  },
}
