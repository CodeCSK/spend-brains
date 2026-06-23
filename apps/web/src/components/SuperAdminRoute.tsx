import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'

import { PageLoadingSkeleton } from '../components/layout'
import { getMe } from '../lib/api/users'
import { profileKeys } from '../lib/query-keys'

export function SuperAdminRoute() {
  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
  })

  if (profileQuery.isLoading) {
    return <PageLoadingSkeleton width="wide" />
  }

  if (profileQuery.isError || !profileQuery.data?.isSuperAdmin) {
    return <Navigate to="/app/events" replace />
  }

  return <Outlet />
}
