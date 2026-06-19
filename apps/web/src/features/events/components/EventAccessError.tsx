import { ArrowLeft } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { PageLayout } from '../../../components/layout'
import { Button, Card } from '../../../components/ui'
import { ApiError } from '../../../lib/api'

type EventAccessErrorProps = {
  error: unknown
}

function getAccessErrorCopy(error: unknown): { title: string; description: string } {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return {
        title: 'Event not found',
        description:
          'This event may have been deleted, or the link is incorrect. Check the URL or go back to your events list.',
      }
    }
    if (error.status === 403) {
      return {
        title: 'Not a member',
        description:
          'You are not a member of this event. Ask the captain for the join code, or wait for your join request to be approved.',
      }
    }
    return {
      title: 'Could not load event',
      description: error.message,
    }
  }

  return {
    title: 'Could not load event',
    description: 'Something went wrong while loading this event. Please try again.',
  }
}

export function EventAccessError({ error }: EventAccessErrorProps) {
  const copy = getAccessErrorCopy(error)

  return (
    <PageLayout width="wide">
      <Card as="article" className="mt-8 sm:mt-10">
        <h1 className="text-xl font-semibold">{copy.title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{copy.description}</p>
        <Button as="link" to="/app/events" variant="secondary" className="mt-6 inline-flex">
          <Icon icon={ArrowLeft} size={20} aria-hidden />
          Back to events
        </Button>
      </Card>
    </PageLayout>
  )
}
