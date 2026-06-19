import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Icon } from '../../../components/Icon'
import { Alert, Button, Card, FormField, Input, Select, Textarea } from '../../../components/ui'
import { ApiError, updateEvent } from '../../../lib/api'
import { eventKeys } from '../../../lib/query-keys'
import { useToast } from '../../../lib/store/useToast'
import type { Event } from '../../../types/event'
import { EVENT_TYPES } from '../../../types/event'
import {
  EVENT_TYPE_LABELS,
  EVENT_VISIBILITY_LABELS,
} from '../lib/event-labels'
import { eventFormSchema, type EventFormValues } from '../lib/event-form-schema'

type EditEventFormProps = {
  event: Event
  eventId: string
}

export function EditEventForm({ event, eventId }: EditEventFormProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.description ?? '',
      location: event.location ?? '',
      eventType: event.eventType,
      visibility: event.visibility,
    },
  })

  useEffect(() => {
    form.reset({
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.description ?? '',
      location: event.location ?? '',
      eventType: event.eventType,
      visibility: event.visibility,
    })
  }, [event, form])

  const updateMutation = useMutation({
    mutationFn: (values: EventFormValues) =>
      updateEvent(eventId, {
        name: values.name.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
        description: values.description?.trim() || null,
        location: values.location?.trim() || null,
        eventType: values.eventType,
        visibility: values.visibility,
      }),
    onSuccess: async () => {
      toast.success('Event saved.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) }),
        queryClient.invalidateQueries({ queryKey: eventKeys.lists() }),
      ])
    },
  })

  const updateError =
    updateMutation.error instanceof ApiError
      ? updateMutation.error.message
      : updateMutation.error?.message

  return (
    <Card as="article">
      <h2 className="text-lg font-semibold text-text-label">Event details</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Changing the event type updates the cover image to that type&apos;s default.
      </p>

      <form
        className="mt-4 space-y-4"
        onSubmit={form.handleSubmit((values) => {
          updateMutation.mutate(values)
        })}
      >
        <FormField
          id="settings-event-name"
          label="Event name"
          error={form.formState.errors.name?.message}
        >
          <Input type="text" maxLength={200} {...form.register('name')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="settings-start-date" label="Start date">
            <Input type="date" {...form.register('startDate')} />
          </FormField>
          <FormField
            id="settings-end-date"
            label="End date"
            error={form.formState.errors.endDate?.message}
          >
            <Input type="date" {...form.register('endDate')} />
          </FormField>
        </div>

        <FormField id="settings-description" label="Description">
          <Textarea rows={3} maxLength={2000} {...form.register('description')} />
        </FormField>

        <FormField id="settings-location" label="Location">
          <Input type="text" maxLength={300} {...form.register('location')} />
        </FormField>

        <FormField id="settings-event-type" label="Event type">
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
            {(['private', 'public'] as const).map((visibility) => (
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
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {updateError && <Alert variant="error">{updateError}</Alert>}

        <Button type="submit" loading={updateMutation.isPending}>
          <Icon icon={Save} size={20} aria-hidden />
          {updateMutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Card>
  )
}
