import { Navigate } from 'react-router-dom'

import { useEventContext } from '../../events/context/EventContext'
import { eventExpensesPath } from '../../events/lib/event-routes'

export function CreateExpensePage() {
  const { eventCode } = useEventContext()
  return <Navigate to={`${eventExpensesPath(eventCode)}?action=create`} replace />
}
