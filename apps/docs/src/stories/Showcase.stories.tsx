import type { Meta, StoryObj } from '@storybook/react'
import { SettingsModalShowcase } from '../showcase/SettingsModalShowcase'
import { WalkmanShowcase } from '../showcase/walkman/WalkmanShowcase'

const meta: Meta = {
  title: 'Showcase',
}
export default meta

export const SettingsModal: StoryObj = {
  render: () => <SettingsModalShowcase />,
}

export const Walkman: StoryObj = {
  render: () => <WalkmanShowcase />,
}
