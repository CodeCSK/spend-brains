import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
} from '../../../components/ui'
import { ApiError, joinEvent, lookupEvent } from '../../../lib/api'
import { eventKeys } from '../../../lib/query-keys'
import { useToast } from '../../../lib/store/useToast'
import type { EventLookup, JoinEventResult } from '../../../types/event'
import {
  EVENT_TYPE_LABELS,
  EVENT_VISIBILITY_LABELS,
  formatEventDateRange,
} from '../lib/event-labels'
import { isLikelyEventUuid, normalizeJoinCode } from '../lib/join-code'
import { eventPath } from '../lib/event-routes'

const joinCodeSchema = z.object({
  publicId: z
    .string()
    .transform(normalizeJoinCode)
    .refine((value) => value.length > 0, 'Enter the event join code')
    .refine((value) => value.length === 8, 'Join code must be 8 characters'),
})

type JoinCodeForm = z.infer<typeof joinCodeSchema>

type EventLookupPreviewProps = {
  lookup: EventLookup
}

function EventLookupPreview({ lookup }: EventLookupPreviewProps) {
  const dateLabel = formatEventDateRange(lookup.startDate, lookup.endDate)

  return (
    <Card as="article" className="overflow-hidden p-0">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-subtle">
        {lookup.coverImageUrl ? (
          <img src={lookup.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            {EVENT_TYPE_LABELS[lookup.eventType]}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold">{lookup.name}</h2>
        <p className="mt-1 text-sm text-text-secondary">{dateLabel}</p>

        <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Type</dt>
            <dd className="font-medium">{EVENT_TYPE_LABELS[lookup.eventType]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Visibility</dt>
            <dd className="font-medium">{EVENT_VISIBILITY_LABELS[lookup.visibility]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Members</dt>
            <dd className="font-medium">
              {lookup.memberCount} member{lookup.memberCount === 1 ? '' : 's'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Join code</dt>
            <dd className="font-mono font-medium">{lookup.publicId}</dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}

function JoinResultAlert({ result }: { result: JoinEventResult }) {
  if (result.status === 'requested') {
    return (
      <Alert as="div" variant="info" live>
        <p className="font-medium">Join request sent</p>
        <p className="mt-1">{result.message}</p>
        <p className="mt-2 text-sm">
          You will see this event in your list once a captain or vice captain approves your
          request.
        </p>
      </Alert>
    )
  }

  return (
    <Alert variant="success" live>
      {result.message}
    </Alert>
  )
}

export function JoinEventPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [lookupCode, setLookupCode] = useState<string | null>(null)
  const [joinResult, setJoinResult] = useState<JoinEventResult | null>(null)
  const [pasteHint, setPasteHint] = useState<string | null>(null)

  const form = useForm<JoinCodeForm>({
    resolver: zodResolver(joinCodeSchema),
    defaultValues: { publicId: '' },
  })

  const lookupQuery = useQuery({
    queryKey: eventKeys.lookup(lookupCode ?? ''),
    queryFn: () => lookupEvent(lookupCode!),
    enabled: lookupCode !== null,
    retry: false,
  })

  const joinMutation = useMutation({
    mutationFn: () => joinEvent(lookupCode!),
    onSuccess: async (result) => {
      setJoinResult(result)

      if (result.status === 'joined' && lookupCode) {
        toast.success('Joined event.')
        await queryClient.invalidateQueries({ queryKey: eventKeys.list() })
        navigate(eventPath(lookupCode), { replace: true })
      } else if (result.status === 'requested') {
        toast.info('Join request sent.')
      }
    },
  })

  const joinError =
    joinMutation.error instanceof ApiError
      ? joinMutation.error.message
      : joinMutation.error?.message

  const lookupError =
    lookupQuery.error instanceof ApiError
      ? lookupQuery.error.message
      : lookupQuery.error?.message

  const preview = lookupQuery.data
  const isPendingRequest = joinResult?.status === 'requested'
  const canJoin = preview && !isPendingRequest && !joinMutation.isPending

  return (
    <PageLayout width="narrow">
      <BackLink to="/app/events">Back to events</BackLink>

      <PageHeader
        title={
          <>
            <Icon icon={UserPlus} size={24} className="text-primary" aria-hidden />
            Join event
          </>
        }
        description="Enter the join code shared by your group."
      />

      <PageSection aria-labelledby="join-event-heading" className="mt-6 sm:mt-8">
        <Card as="article">
          <h2 id="join-event-heading" className="text-lg font-semibold text-text-label">
            Join code
          </h2>

          <form
            className="mt-4 space-y-4"
            onSubmit={form.handleSubmit((values) => {
              setPasteHint(null)
              setJoinResult(null)
              setLookupCode(values.publicId)
            })}
          >
            <FormField
              id="join-code"
              label="Event code"
              error={form.formState.errors.publicId?.message}
            >
              <Controller
                name="publicId"
                control={form.control}
                render={({ field }) => (
                  <Input
                    type="text"
                    maxLength={8}
                    placeholder="AB23CD45"
                    autoComplete="off"
                    spellCheck={false}
                    inputMode="text"
                    className="font-mono text-base sm:text-lg"
                    value={field.value}
                    onChange={(event) => {
                      const raw = event.target.value
                      if (isLikelyEventUuid(raw)) {
                        setPasteHint(
                          'That looks like an event URL ID. Ask your group for the 8-character join code instead.',
                        )
                      } else {
                        setPasteHint(null)
                      }
                      field.onChange(normalizeJoinCode(raw))
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </FormField>
            <p className="text-xs text-text-muted">
              8-character code (e.g. AB23CD45). Not the long ID from an event link.
            </p>

            {pasteHint && (
              <Alert variant="warning" live>
                {pasteHint}
              </Alert>
            )}

            <Button
              type="submit"
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={lookupQuery.isFetching && lookupCode !== null}
            >
              {lookupQuery.isFetching ? 'Looking up…' : 'Find event'}
            </Button>
          </form>
        </Card>

        {lookupCode && lookupQuery.isFetching && (
          <p className="mt-6 text-sm text-text-secondary" role="status">
            Looking up event…
          </p>
        )}

        {lookupCode && lookupQuery.isError && (
          <Alert variant="error" className="mt-6">
            {lookupError ?? 'Event not found'}
          </Alert>
        )}

        {preview && (
          <div className="mt-6 space-y-4">
            <EventLookupPreview lookup={preview} />

            {preview.visibility === 'public' ? (
              <p className="text-sm text-text-secondary">
                This is a public event — you will join immediately.
              </p>
            ) : (
              <p className="text-sm text-text-secondary">
                This is a private event — the captain or vice captain must approve your request
                before you can access it.
              </p>
            )}

            {isPendingRequest && joinResult && <JoinResultAlert result={joinResult} />}

            {joinError && <Alert variant="error">{joinError}</Alert>}

            {canJoin && (
              <Button
                type="button"
                className="w-full sm:w-auto"
                loading={joinMutation.isPending}
                onClick={() => joinMutation.mutate()}
              >
                {joinMutation.isPending
                  ? 'Joining…'
                  : preview.visibility === 'public'
                    ? 'Join event'
                    : 'Request to join'}
              </Button>
            )}
          </div>
        )}
      </PageSection>
    </PageLayout>
  )
}
