import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Icon } from '../../../components/Icon'
import { Alert, Button, FormField, Input, SegmentedControl, Select, Textarea } from '../../../components/ui'
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

export const EDIT_EVENT_FORM_ID = 'edit-event-form'

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

  const saveButton = (
    <Button
      type="submit"
      form={EDIT_EVENT_FORM_ID}
      className="h-8 shrink-0 px-2.5 text-xs sm:text-sm"
      loading={updateMutation.isPending}
    >
      <Icon icon={Save} size={16} aria-hidden />
      {updateMutation.isPending ? 'Saving…' : 'Save'}
    </Button>
  )

  return (
    <section aria-labelledby="event-details-heading" className="xp-section-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id="event-details-heading" className="text-sm font-semibold text-text-label sm:text-base">
            Event details
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Changing type updates the cover image.
          </p>
        </div>
        {saveButton}
      </div>

      <form
        id={EDIT_EVENT_FORM_ID}
        className="xp-form-dense mt-3"
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

        <div className="grid gap-3 sm:grid-cols-2">
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

        <FormField id="settings-location" label="Location">
          <Input type="text" maxLength={300} placeholder="City or venue" {...form.register('location')} />
        </FormField>

        <FormField id="settings-description" label="Description">
          <Textarea rows={2} maxLength={2000} {...form.register('description')} />
        </FormField>

        <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
          <FormField id="settings-event-type" label="Event type">
            <Select {...form.register('eventType')}>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {EVENT_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </FormField>

          <Controller
            name="visibility"
            control={form.control}
            render={({ field }) => (
              <FormField id="settings-visibility" label="Visibility">
                <SegmentedControl
                  value={field.value}
                  onChange={field.onChange}
                  options={(['private', 'public'] as const).map((visibility) => ({
                    value: visibility,
                    label: EVENT_VISIBILITY_LABELS[visibility],
                  }))}
                  aria-label="Event visibility"
                  size="compact"
                  stretch
                  className="mt-1 w-full [&>button]:min-w-0 [&>button]:flex-1"
                />
              </FormField>
            )}
          />
        </div>

        {updateError && <Alert variant="error">{updateError}</Alert>}
      </form>
    </section>
  )
}
