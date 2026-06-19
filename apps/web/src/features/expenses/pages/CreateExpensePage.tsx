import { Receipt } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { PageHeader } from '../../../components/layout'
import { BackLink } from '../../../components/ui'
import { useEventContext } from '../../events/context/EventContext'
import { ExpenseForm } from '../components/ExpenseForm'

export function CreateExpensePage() {
  const { eventId } = useEventContext()

  return (
    <>
      <BackLink to={`/app/events/${eventId}/expenses`}>Back to expenses</BackLink>

      <PageHeader
        title={
          <>
            <Icon icon={Receipt} size={24} className="text-primary" aria-hidden />
            Add expense
          </>
        }
        description="Log a shared cost. Amounts are split equally among selected members."
      />

      <div className="mt-6 sm:mt-8">
        <ExpenseForm mode="create" />
      </div>
    </>
  )
}
