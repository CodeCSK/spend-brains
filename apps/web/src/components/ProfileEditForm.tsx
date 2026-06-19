import { zodResolver } from '@hookform/resolvers/zod'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { z } from 'zod'
import { Save } from 'lucide-react'

import { Icon } from './Icon'
import { Alert, Button, Card } from './ui'
import { ApiError, updateMe } from '../lib/api'
import { profileKeys } from '../lib/query-keys'
import { useToast } from '../lib/store/useToast'

import { AVATAR_PRESETS, isAvatarPreset } from '../lib/avatar-presets'

import type { UserProfile } from '../types/auth'



const profileSchema = z.object({

  displayName: z.string().max(100, 'Display name must be at most 100 characters'),

  avatarUrl: z

    .union([z.enum(AVATAR_PRESETS), z.literal('none')])

    .nullable(),

})



type ProfileForm = z.infer<typeof profileSchema>



type ProfileEditFormProps = {
  profile: UserProfile
  headingId?: string
}



const avatarSelectedClass =

  'border-primary ring-2 ring-primary ring-offset-2'

const avatarDefaultClass =
  'border-border hover:border-border-focus'



export function ProfileEditForm({ profile, headingId }: ProfileEditFormProps) {

  const queryClient = useQueryClient()
  const toast = useToast()



  const form = useForm<ProfileForm>({

    resolver: zodResolver(profileSchema),

    defaultValues: {

      displayName: profile.displayName ?? '',

      avatarUrl: isAvatarPreset(profile.avatarUrl) ? profile.avatarUrl : 'none',

    },

  })



  useEffect(() => {

    form.reset({

      displayName: profile.displayName ?? '',

      avatarUrl: isAvatarPreset(profile.avatarUrl) ? profile.avatarUrl : 'none',

    })

  }, [profile, form])



  const updateMutation = useMutation({

    mutationFn: (values: ProfileForm) =>

      updateMe({

        displayName: values.displayName.trim() || null,

        avatarUrl: values.avatarUrl === 'none' ? null : values.avatarUrl,

      }),

    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me, data)
      toast.success('Profile saved.')
    },

  })



  const selectedAvatar = form.watch('avatarUrl')

  const updateError =

    updateMutation.error instanceof ApiError

      ? updateMutation.error.message

      : updateMutation.error?.message



  return (

    <Card as="article">
      <h2
        id={headingId}
        className="text-lg font-semibold text-text-label"
      >
        Edit profile
      </h2>

      {!profile.displayName && (
        <Alert variant="warning" live className="mt-2">
          Add a display name so friends can recognize you in events.
        </Alert>
      )}



      <form

        className="mt-4 space-y-4"

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

          <p className="text-sm font-medium text-text-label">Avatar</p>

          <div className="mt-2 flex items-center gap-3">

            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xp-full border border-border bg-surface-page">

              {selectedAvatar && selectedAvatar !== 'none' ? (

                <img

                  src={selectedAvatar}

                  alt="Selected avatar"

                  className="h-full w-full object-cover"

                />

              ) : (

                <span className="text-xs text-text-muted">None</span>

              )}

            </div>

            <p className="text-xs text-text-muted">Pick a preset avatar below.</p>

          </div>



          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">

            <button

              type="button"

              onClick={() =>

                form.setValue('avatarUrl', 'none', { shouldDirty: true })

              }

              className={`flex h-14 w-14 items-center justify-center rounded-xp-full border text-xs ${

                selectedAvatar === 'none' ? avatarSelectedClass : avatarDefaultClass

              }`}

            >

              None

            </button>

            {AVATAR_PRESETS.map((url) => (

              <button

                key={url}

                type="button"

                onClick={() => form.setValue('avatarUrl', url, { shouldDirty: true })}

                className={`h-14 w-14 overflow-hidden rounded-xp-full border ${

                  selectedAvatar === url ? avatarSelectedClass : avatarDefaultClass

                }`}

              >

                <img src={url} alt="" className="h-full w-full object-cover" />

              </button>

            ))}

          </div>

          {form.formState.errors.avatarUrl && (

            <p className="mt-1 text-sm text-error-text">

              {form.formState.errors.avatarUrl.message}

            </p>

          )}

        </div>



        {updateError && <Alert variant="error">{updateError}</Alert>}

        <Button type="submit" loading={updateMutation.isPending}>
          <Icon icon={Save} size={20} />
          {updateMutation.isPending ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </Card>

  )

}


