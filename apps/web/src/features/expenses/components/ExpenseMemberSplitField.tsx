import { Avatar, Checkbox } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import type { Member } from '../../../types/member'

type ExpenseMemberSplitFieldProps = {
  members: Member[]
  value: string[]
  onChange: (userIds: string[]) => void
  error?: string
}

export function ExpenseMemberSplitField({
  members,
  value,
  onChange,
  error,
}: ExpenseMemberSplitFieldProps) {
  const selectedCount = value.length
  const allSelected = members.length > 0 && selectedCount === members.length

  function toggleMember(userId: string, checked: boolean) {
    if (checked) {
      onChange([...value, userId])
      return
    }
    onChange(value.filter((id) => id !== userId))
  }

  function selectAll() {
    onChange(members.map((member) => member.userId))
  }

  function clearAll() {
    onChange([])
  }

  return (
    <fieldset className="rounded-xp-lg border border-border bg-surface-subtle/40 p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <legend className="text-sm font-medium text-text-label">Split among</legend>
          <p className="mt-0.5 text-xs text-text-secondary">
            Equal split among selected members. {selectedCount} of {members.length} selected.
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            className="rounded-xp-md px-2 py-1 text-xs font-medium text-primary hover:bg-surface-subtle disabled:opacity-50"
            disabled={allSelected}
            onClick={selectAll}
          >
            Select all
          </button>
          <button
            type="button"
            className="rounded-xp-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-subtle disabled:opacity-50"
            disabled={selectedCount === 0}
            onClick={clearAll}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {members.map((member) => {
          const checked = value.includes(member.userId)
          const label = member.displayName ?? member.phone

          return (
            <label
              key={member.userId}
              className={cn(
                'flex min-h-11 cursor-pointer items-center gap-3 rounded-xp-md border px-3 py-2 transition-colors',
                checked
                  ? 'border-primary/40 bg-surface-raised shadow-xp-sm'
                  : 'border-border bg-surface-raised hover:bg-surface-subtle/80',
              )}
            >
              <Checkbox
                checked={checked}
                onChange={(event) => toggleMember(member.userId, event.target.checked)}
              />
              <Avatar src={member.avatarUrl} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
            </label>
          )
        })}
      </div>

      {error && (
        <p className="mt-2 text-sm text-error-text" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
