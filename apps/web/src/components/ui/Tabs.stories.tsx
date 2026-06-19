import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { Receipt, Scale, Users } from 'lucide-react'

import { Tab, Tabs } from './Tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/expenses']}>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const EventSections: Story = {
  render: () => (
    <Tabs aria-label="Event sections" className="mt-6">
      <Tab to="/expenses" icon={Receipt}>
        Expenses
      </Tab>
      <Tab to="/members" icon={Users}>
        Members
      </Tab>
      <Tab to="/settlements" icon={Scale}>
        Settlements
      </Tab>
    </Tabs>
  ),
}
