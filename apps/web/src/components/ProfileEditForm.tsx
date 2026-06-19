import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icon } from './Icon'
import { PresetAvatarTile } from './ProfileAvatar'
import { Alert, Button, Card } from './ui'
import { ApiError, updateMe } from '../lib/api'
import {
  AVATAR_PRESETS,
  AVATAR_PRESET_IDS,
  presetStorageValue,
  resolveAvatarPresetId,
  type AvatarPresetId,
} from '../lib/avatar-presets'
import { profileKeys } from '../lib/query-keys'
import { useToast } from '../lib/store/useToast'
import type { UserProfile } from '../types/auth'

const profileSchema = z.object({
  displayName: z.string().max(100, 'Display name must be at most 100 characters'),
  avatarPresetId: z.enum(AVATAR_PRESET_IDS as [AvatarPresetId, ...AvatarPresetId[]]),
})

type ProfileForm = z.infer<typeof profileSchema>

type ProfileEditFormProps = {
  profile: UserProfile
  headingId?: string
  variant?: 'card' | 'plain'
  onSaved?: () => void
}

export function ProfileEditForm({
  profile,
  headingId,
  variant = 'card',
  onSaved,
}: ProfileEditFormProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile.displayName ?? '',
      avatarPresetId: resolveAvatarPresetId(profile.avatarUrl),
    },
  })

  useEffect(() => {
    form.reset({
      displayName: profile.displayName ?? '',
      avatarPresetId: resolveAvatarPresetId(profile.avatarUrl),
    })
  }, [profile, form])

  const updateMutation = useMutation({
    mutationFn: (values: ProfileForm) =>
      updateMe({
        displayName: values.displayName.trim() || null,
        avatarUrl: presetStorageValue(values.avatarPresetId),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me, data)
      toast.success('Profile saved.')
      onSaved?.()
    },
  })

  const selectedPresetId = form.watch('avatarPresetId')
  const updateError =
    updateMutation.error instanceof ApiError
      ? updateMutation.error.message
      : updateMutation.error?.message

  const formContent = (
    <>
      {!profile.displayName && variant === 'card' && (
        <Alert variant="warning" live className="mt-2">
          Add a display name so friends can recognize you in events.
        </Alert>
      )}

      <form
        className={variant === 'card' ? 'mt-4 space-y-4' : 'space-y-4'}
        onSubmit={form.handleSubmit((values) => {
          updateMutation.mutate(values)
        })}
      >
        <div>
          <label htmlFor="displayName" className="xp-label">
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            maxLength={100}
            placeholder="Your name"
            className="xp-input"
            {...form.register('displayName')}
          />
          {form.formState.errors.displayName && (
            <p className="mt-1 text-sm text-error-text">
              {form.formState.errors.displayName.message}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-text-label">Profile icon</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Pick a character — like Netflix profile icons.
          </p>

          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-4">
            {AVATAR_PRESETS.map((preset) => (
              <div key={preset.id} className="flex flex-col items-center gap-1">
                <PresetAvatarTile
                  preset={preset}
                  size="lg"
                  className="h-14 w-14"
                  selected={selectedPresetId === preset.id}
                  onClick={() =>
                    form.setValue('avatarPresetId', preset.id, { shouldDirty: true })
                  }
                />
                <span className="text-[10px] font-medium text-text-muted">{preset.label}</span>
              </div>
            ))}
          </div>
        </div>

        {updateError && <Alert variant="error">{updateError}</Alert>}

        <Button type="submit" loading={updateMutation.isPending}>
          <Icon icon={Save} size={16} />
          {updateMutation.isPending ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </>
  )

  if (variant === 'plain') {
    return formContent
  }

  return (
    <Card as="article">
      <h2 id={headingId} className="text-base font-semibold text-text-label">
        Edit profile
      </h2>
      {formContent}
    </Card>
  )
}
