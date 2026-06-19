import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icon } from '../../../components/Icon'
import { Alert, Button, Card, FormField, Input } from '../../../components/ui'
import { ApiError, addMember } from '../../../lib/api'
import {
  INDIAN_PHONE_E164_REGEX,
  normalizeIndianPhone,
} from '../../../lib/phone'
import { eventKeys, memberKeys } from '../../../lib/query-keys'
import { useToast } from '../../../lib/store/useToast'

const addMemberSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone is required')
    .transform(normalizeIndianPhone)
    .refine(
      (phone) => INDIAN_PHONE_E164_REGEX.test(phone),
      'Enter a valid Indian mobile (+91 or 10 digits)',
    ),
})

type AddMemberFormValues = z.infer<typeof addMemberSchema>

type AddMemberFormProps = {
  eventId: string
}

export function AddMemberForm({ eventId }: AddMemberFormProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { phone: '' },
  })

  const addMutation = useMutation({
    mutationFn: (values: AddMemberFormValues) =>
      addMember(eventId, { phone: values.phone }),
    onSuccess: async () => {
      form.reset()
      toast.success('Member added.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: memberKeys.list(eventId) }),
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) }),
      ])
    },
  })

  const addError =
    addMutation.error instanceof ApiError
      ? addMutation.error.message
      : addMutation.error?.message

  return (
    <Card as="article">
      <h2 className="text-lg font-semibold text-text-label">Add member</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Add someone who already has a Spendbrains account using their phone number.
      </p>

      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start"
        onSubmit={form.handleSubmit((values) => {
          addMutation.mutate(values)
        })}
      >
        <FormField
          id="member-phone"
          label="Phone"
          error={form.formState.errors.phone?.message}
          className="min-w-0 flex-1"
        >
          <Input
            type="tel"
            autoComplete="tel"
            placeholder="+91XXXXXXXXXX or 10 digits"
            {...form.register('phone')}
          />
        </FormField>

        <Button
          type="submit"
          loading={addMutation.isPending}
          className="shrink-0 sm:mt-[1.625rem]"
        >
          <Icon icon={UserPlus} size={20} aria-hidden />
          {addMutation.isPending ? 'Adding…' : 'Add member'}
        </Button>
      </form>

      {addError && (
        <Alert variant="error" className="mt-3">
          {addError}
        </Alert>
      )}
    </Card>
  )
}
