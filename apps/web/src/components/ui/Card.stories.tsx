import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './Button'
import { Card, CardBody, CardFooter, CardHeader } from './Card'

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <h2 className="text-lg font-semibold">Card title</h2>
        <p className="mt-1 text-sm text-text-secondary">Optional description.</p>
      </CardHeader>
      <CardBody className="mt-4">
        <p className="text-sm text-text-primary">Main card content goes here.</p>
      </CardBody>
      <CardFooter>
        <Button variant="primary">Action</Button>
      </CardFooter>
    </Card>
  ),
}

export const AsArticle: Story = {
  render: () => (
    <Card as="article" className="max-w-md">
      <h2 className="text-lg font-semibold">Semantic article</h2>
      <p className="mt-2 text-sm text-text-secondary">Used for auth and profile cards.</p>
    </Card>
  ),
}

export const FlushPadding: Story = {
  render: () => (
    <Card className="max-w-sm overflow-hidden p-0">
      <div className="aspect-video bg-surface-subtle" />
      <CardBody className="p-4">
        <p className="font-medium">Flush card body</p>
      </CardBody>
    </Card>
  ),
}
