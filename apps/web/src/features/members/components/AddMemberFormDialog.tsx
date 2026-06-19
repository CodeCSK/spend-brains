import { Dialog } from '../../../components/ui'
import { MemberForm } from './MemberForm'

type AddMemberFormDialogProps = {
  open: boolean
  onClose: () => void
  eventId: string
}

export function AddMemberFormDialog({ open, onClose, eventId }: AddMemberFormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add member"
      description="Add someone using their registered phone number."
      variant="form"
      size="md"
    >
      <MemberForm key={open ? 'open' : 'closed'} eventId={eventId} onSuccess={onClose} />
    </Dialog>
  )
}
