import { Calendar, Pencil, Phone, ShieldCheck, User } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Icon } from '../../../components/Icon'
import { ProfileEditForm } from '../../../components/ProfileEditForm'
import { PageHeader, PageLayout, PageLoadingSkeleton, PageSection } from '../../../components/layout'
import { Alert, Button, Card, Dialog } from '../../../components/ui'
import { ApiError, getMe } from '../../../lib/api'
import { profileKeys } from '../../../lib/query-keys'
import { ProfileAvatar } from '../../../components/ProfileAvatar'

function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ProfilePage() {
  const [editOpen, setEditOpen] = useState(false)

  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
    retry: false,
  })

  if (profileQuery.isLoading) {
    return <PageLoadingSkeleton width="narrow" />
  }

  if (profileQuery.isError) {
    const message =
      profileQuery.error instanceof ApiError
        ? profileQuery.error.message
        : 'Failed to load profile'

    return (
      <PageLayout width="narrow">
        <Alert as="div" variant="error">
          <p>{message}</p>
          <Button as="link" to="/login" variant="ghost" className="mt-2 px-0 text-error-text-strong">
            Back to login
          </Button>
        </Alert>
      </PageLayout>
    )
  }

  const profile = profileQuery.data
  if (!profile) {
    return null
  }

  return (
    <PageLayout width="narrow">
      <PageHeader
        title={
          <>
            <Icon icon={User} size={20} className="text-primary" aria-hidden />
            Profile
          </>
        }
        description="Account details."
        action={
          <Button type="button" variant="secondary" onClick={() => setEditOpen(true)}>
            <Icon icon={Pencil} size={16} aria-hidden />
            Edit
          </Button>
        }
      />

      <PageSection aria-labelledby="profile-details-heading" className="mt-4">
        <Card as="article" className="p-3 sm:p-4">
          <h2 id="profile-details-heading" className="sr-only">
            Account
          </h2>

          <div className="flex items-center gap-3">
            <ProfileAvatar
              avatarUrl={profile.avatarUrl}
              alt={profile.displayName ?? 'Profile avatar'}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold">
                {profile.displayName ?? 'No display name'}
              </p>
              <p className="truncate text-sm text-text-secondary">{profile.phone}</p>
            </div>
          </div>

          <dl className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Icon icon={Phone} size={16} className="shrink-0 text-text-muted" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs text-text-muted">Phone</dt>
                <dd className="truncate font-medium">{profile.phone}</dd>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon icon={ShieldCheck} size={16} className="shrink-0 text-text-muted" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs text-text-muted">Verified</dt>
                <dd className="font-medium">{formatShortDate(profile.phoneVerifiedAt)}</dd>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm sm:col-span-2">
              <Icon icon={Calendar} size={16} className="shrink-0 text-text-muted" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs text-text-muted">Member since</dt>
                <dd className="font-medium">{formatShortDate(profile.createdAt)}</dd>
              </div>
            </div>
          </dl>
        </Card>
      </PageSection>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        className="max-w-lg"
      >
        <ProfileEditForm
          profile={profile}
          variant="plain"
          onSaved={() => setEditOpen(false)}
        />
      </Dialog>
    </PageLayout>
  )
}
