import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icon } from '../../../components/Icon'
import { Alert, Button, FormField, Input } from '../../../components/ui'
import { ApiError, addMember } from '../../../lib/api'
import {
  INDIAN_PHONE_E164_REGEX,
  normalizeIndianPhone,
} from '../../../lib/phone'
import { eventKeys, memberKeys } from '../../../lib/query-keys'
import { useToast } from '../../../lib/store/useToast'

const memberFormSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone is required')
    .transform(normalizeIndianPhone)
    .refine(
      (phone) => INDIAN_PHONE_E164_REGEX.test(phone),
      'Enter a valid Indian mobile (+91 or 10 digits)',
    ),
})

export type MemberFormValues = z.infer<typeof memberFormSchema>

export const MEMBER_FORM_ID = 'member-form'

type MemberFormProps = {
  eventId: string
  layout?: 'modal'
  onSuccess?: () => void
}

export function MemberForm({ eventId, layout = 'modal', onSuccess }: MemberFormProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: { phone: '' },
  })

  const addMutation = useMutation({
    mutationFn: (values: MemberFormValues) =>
      addMember(eventId, { phone: values.phone }),
    onSuccess: async () => {
      form.reset()
      toast.success('Member added.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: memberKeys.list(eventId) }),
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) }),
      ])
      onSuccess?.()
    },
  })

  const addError =
    addMutation.error instanceof ApiError
      ? addMutation.error.message
      : addMutation.error?.message

  const formFields = (
    <>
      <FormField
        id="member-phone"
        label="Phone"
        hint="They must already have a Spendbrains account."
        error={form.formState.errors.phone?.message}
      >
        <Input
          type="tel"
          autoComplete="tel"
          placeholder="+91XXXXXXXXXX or 10 digits"
          autoFocus={layout === 'modal'}
          {...form.register('phone')}
        />
      </FormField>

      {addError && <Alert variant="error">{addError}</Alert>}
    </>
  )

  const footerActions = (
    <Button
      type="submit"
      form={MEMBER_FORM_ID}
      loading={addMutation.isPending}
      className="w-full sm:w-auto"
    >
      <Icon icon={UserPlus} size={20} aria-hidden />
      {addMutation.isPending ? 'Adding…' : 'Add member'}
    </Button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <form
        id={MEMBER_FORM_ID}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5"
        onSubmit={form.handleSubmit((values) => addMutation.mutate(values))}
      >
        {formFields}
      </form>
      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-surface-raised px-4 py-3 sm:flex-row sm:justify-end sm:px-5 sm:py-4">
        {footerActions}
      </div>
    </div>
  )
}
