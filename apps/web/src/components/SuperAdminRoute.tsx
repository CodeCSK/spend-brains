import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'

import { PageLayout } from '../components/layout'
import { getMe } from '../lib/api/users'
import { profileKeys } from '../lib/query-keys'

export function SuperAdminRoute() {
  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
  })

  if (profileQuery.isLoading) {
    return (
      <PageLayout width="wide">
        <p className="text-sm text-text-secondary" role="status">
          Checking access…
        </p>
      </PageLayout>
    )
  }

  if (profileQuery.isError || !profileQuery.data?.isSuperAdmin) {
    return <Navigate to="/app/events" replace />
  }

  return <Outlet />
}
