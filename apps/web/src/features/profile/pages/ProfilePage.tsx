import { useQuery } from '@tanstack/react-query'
import { User } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { ProfileEditForm } from '../../../components/ProfileEditForm'
import { PageHeader, PageLayout, PageSection } from '../../../components/layout'
import { Alert, Avatar, Button, Card } from '../../../components/ui'
import { ApiError, getMe } from '../../../lib/api'
import { profileKeys } from '../../../lib/query-keys'

export function ProfilePage() {
  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
    retry: false,
  })

  if (profileQuery.isLoading) {
    return (
      <PageLayout width="narrow">
        <p className="text-sm text-text-secondary" role="status">
          Loading profile…
        </p>
      </PageLayout>
    )
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
          <Button as="link" to="/login" variant="ghost" className="mt-3 px-0 text-error-text-strong">
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
            <Icon icon={User} size={24} className="text-primary" aria-hidden />
            Profile
          </>
        }
        description="Your display name and avatar for events."
      />

      <PageSection
        aria-labelledby="profile-details-heading"
        className="mt-6 sm:mt-8"
      >
        <Card as="article">
          <h2 id="profile-details-heading" className="text-lg font-semibold">
            Account
          </h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar src={profile.avatarUrl} size="lg" fallback="No avatar" className="h-16 w-16" />

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">
                {profile.displayName ?? 'No display name'}
              </p>
              <p className="text-sm text-text-secondary">{profile.phone}</p>
            </div>
          </div>

          <dl className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
            <div>
              <dt className="text-text-muted">Phone verified</dt>
              <dd className="font-medium">
                {profile.phoneVerifiedAt
                  ? new Date(profile.phoneVerifiedAt).toLocaleString()
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Member since</dt>
              <dd className="font-medium">
                {new Date(profile.createdAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>
      </PageSection>

      <PageSection aria-labelledby="profile-edit-heading" className="mt-10">
        <ProfileEditForm profile={profile} headingId="profile-edit-heading" />
      </PageSection>
    </PageLayout>
  )
}
