import { Dialog } from '../../../components/ui'
import type { Category } from '../../../types/category'
import { CategoryForm } from './CategoryForm'

type CategoryFormDialogProps = {
  open: boolean
  onClose: () => void
  eventId: string
  mode: 'create' | 'edit'
  category?: Category
}

export function CategoryFormDialog({
  open,
  onClose,
  eventId,
  mode,
  category,
}: CategoryFormDialogProps) {
  const title = mode === 'create' ? 'Add category' : 'Edit category'
  const description =
    mode === 'create'
      ? 'Create a custom category for this event.'
      : `Update "${category?.name ?? 'category'}".`

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      variant="form"
      size="md"
    >
      <CategoryForm
        key={mode === 'edit' ? category?.id : 'create'}
        eventId={eventId}
        mode={mode}
        category={category}
        layout="modal"
        onSuccess={onClose}
      />
    </Dialog>
  )
}
