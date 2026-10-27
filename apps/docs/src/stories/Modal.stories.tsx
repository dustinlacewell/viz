import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal, Display, Panel, PushButton, ChipToggle } from '@ldlework/phosphor'

const meta: Meta<typeof Modal> = {
  title: 'Primitives/Modal',
  component: Modal,
}
export default meta

export const Default: StoryObj<typeof Modal> = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [confirmed, setConfirmed] = useState(false)
    return (
      <>
        <Panel style={{ padding: 20 }}>
          <PushButton onClick={() => setOpen(true)}>Open dialog</PushButton>
        </Panel>
        <Modal open={open} onClose={() => setOpen(false)} ariaLabel="Example">
          <Display padding={16}>
            <div className="screen-chip-row">
              <span className="screen-chip" data-lit="true">ARE YOU SURE?</span>
            </div>
            <div className="screen-divider" />
            <div className="screen-row">
              <span className="screen-row-label">Confirm</span>
              <ChipToggle value={confirmed} onChange={setConfirmed}>
                {confirmed ? 'YES' : 'NO'}
              </ChipToggle>
            </div>
          </Display>
        </Modal>
      </>
    )
  },
}
