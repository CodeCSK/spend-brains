import { Navigate, useParams } from 'react-router-dom'

import { useEventContext } from '../../events/context/EventContext'
import { eventExpensesPath } from '../../events/lib/event-routes'

export function EditExpensePage() {
  const { eventCode } = useEventContext()
  const { expenseId } = useParams<{ expenseId: string }>()

  if (!expenseId) {
    return <Navigate to={eventExpensesPath(eventCode)} replace />
  }

  return (
    <Navigate to={`${eventExpensesPath(eventCode)}?edit=${expenseId}`} replace />
  )
}
