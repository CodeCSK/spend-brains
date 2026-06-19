import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Icon } from '../../../components/Icon'
import { PageHeader, PageLayout, PageSection } from '../../../components/layout'
import {
  Alert,
  BackLink,
  Button,
  Card,
  FormField,
  Input,
  Select,
  Textarea,
} from '../../../components/ui'
import { ApiError, createEvent } from '../../../lib/api'
import { eventKeys } from '../../../lib/query-keys'
import { useToast } from '../../../lib/store/useToast'
import {
  EVENT_TYPE_LABELS,
  EVENT_VISIBILITY_LABELS,
} from '../lib/event-labels'
import { EVENT_TYPES, EVENT_VISIBILITIES } from '../../../types/event'

const createEventSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Event name is required')
      .max(200, 'Name must be at most 200 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z
      .string()
      .max(2000, 'Description must be at most 2000 characters')
      .optional(),
    location: z
      .string()
      .max(300, 'Location must be at most 300 characters')
      .optional(),
    eventType: z.enum(EVENT_TYPES),
    visibility: z.enum(EVENT_VISIBILITIES),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })

type CreateEventForm = z.infer<typeof createEventSchema>

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function CreateEventPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const today = todayIsoDate()

  const form = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: '',
      startDate: today,
      endDate: today,
      description: '',
      location: '',
      eventType: 'general',
      visibility: 'private',
    },
  })

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: async (event) => {
      toast.success('Event created.')
      await queryClient.invalidateQueries({ queryKey: eventKeys.list() })
      navigate(`/app/events/${event.id}`, { replace: true })
    },
  })

  const createError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error?.message

  return (
    <PageLayout width="narrow">
      <BackLink to="/app/events">Back to events</BackLink>

      <PageHeader
        title={
          <>
            <Icon icon={CalendarPlus} size={24} className="text-primary" aria-hidden />
            Create event
          </>
        }
        description="Set up a group to track shared expenses."
      />

      <PageSection aria-labelledby="create-event-heading" className="mt-6 sm:mt-8">
        <Card as="article">
          <h2 id="create-event-heading" className="text-lg font-semibold text-text-label">
            Event details
          </h2>

          <form
            className="mt-4 space-y-4"
            onSubmit={form.handleSubmit((values) => {
              createMutation.mutate({
                name: values.name.trim(),
                startDate: values.startDate,
                endDate: values.endDate,
                description: values.description?.trim() || null,
                location: values.location?.trim() || null,
                eventType: values.eventType,
                visibility: values.visibility,
              })
            })}
          >
            <FormField
              id="event-name"
              label="Event name"
              error={form.formState.errors.name?.message}
            >
              <Input
                type="text"
                maxLength={200}
                placeholder="Goa trip 2026"
                autoFocus
                {...form.register('name')}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="event-start-date"
                label="Start date"
                error={form.formState.errors.startDate?.message}
              >
                <Input type="date" {...form.register('startDate')} />
              </FormField>

              <FormField
                id="event-end-date"
                label="End date"
                error={form.formState.errors.endDate?.message}
              >
                <Input type="date" {...form.register('endDate')} />
              </FormField>
            </div>

            <FormField
              id="event-description"
              label={
                <>
                  Description <span className="font-normal text-text-muted">(optional)</span>
                </>
              }
              error={form.formState.errors.description?.message}
            >
              <Textarea
                rows={3}
                maxLength={2000}
                placeholder="What is this event about?"
                {...form.register('description')}
              />
            </FormField>

            <FormField
              id="event-location"
              label={
                <>
                  Location <span className="font-normal text-text-muted">(optional)</span>
                </>
              }
              error={form.formState.errors.location?.message}
            >
              <Input
                type="text"
                maxLength={300}
                placeholder="Goa, India"
                {...form.register('location')}
              />
            </FormField>

            <FormField id="event-type" label="Event type">
              <Select {...form.register('eventType')}>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </FormField>

            <fieldset>
              <legend className="xp-label">Visibility</legend>
              <div className="mt-2 space-y-2">
                {EVENT_VISIBILITIES.map((visibility) => (
                  <label
                    key={visibility}
                    className="flex cursor-pointer items-start gap-3 rounded-xp-lg border border-border px-3 py-3 has-[:checked]:border-border-focus has-[:checked]:bg-surface-subtle"
                  >
                    <input
                      type="radio"
                      value={visibility}
                      className="mt-1"
                      {...form.register('visibility')}
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        {EVENT_VISIBILITY_LABELS[visibility]}
                      </span>
                      <span className="block text-xs text-text-muted">
                        {visibility === 'public'
                          ? 'Anyone with the join code can join immediately.'
                          : 'Join requests must be approved by the captain or vice captain.'}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {createError && <Alert variant="error">{createError}</Alert>}

            <Button
              type="submit"
              loading={createMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createMutation.isPending ? 'Creating…' : 'Create event'}
            </Button>
          </form>
        </Card>
      </PageSection>
    </PageLayout>
  )
}
