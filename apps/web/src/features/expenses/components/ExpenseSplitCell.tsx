import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Amount } from '../../../components/ui'
import type { ExpenseShare } from '../../../types/expense'
import { getMemberInitials, memberInitialColor } from '../lib/member-initials'

const MAX_VISIBLE_INITIALS = 3

type ShareMember = {
  userId: string
  label: string
  initials: string
  amount: string
}

type ExpenseSplitCellProps = {
  shares: ExpenseShare[]
  getMemberLabel: (userId: string) => string
}

function buildShareMembers(
  shares: ExpenseShare[],
  getMemberLabel: (userId: string) => string,
): ShareMember[] {
  return shares.map((share) => {
    const label = getMemberLabel(share.userId)
    return {
      userId: share.userId,
      label,
      initials: getMemberInitials(label),
      amount: share.amount,
    }
  })
}

export function ExpenseSplitCell({ shares, getMemberLabel }: ExpenseSplitCellProps) {
  const popoverId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const members = buildShareMembers(shares, getMemberLabel)
  const visible = members.slice(0, MAX_VISIBLE_INITIALS)
  const overflow = Math.max(0, members.length - visible.length)

  function updatePosition() {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const panelWidth = 240
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - panelWidth - 8)

    setPosition({
      top: rect.bottom + 8,
      left,
    })
  }

  function showPopover() {
    updatePosition()
    setOpen(true)
  }

  function hidePopover() {
    setOpen(false)
  }

  function togglePopover() {
    if (open) {
      hidePopover()
      return
    }
    showPopover()
  }

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node
      if (triggerRef.current?.contains(target)) return
      const panel = document.getElementById(popoverId)
      if (panel?.contains(target)) return
      hidePopover()
    }

    function handleScrollOrResize() {
      updatePosition()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [open, popoverId])

  if (members.length === 0) {
    return <span className="text-text-muted">—</span>
  }

  const popover = open
    ? createPortal(
        <div
          id={popoverId}
          role="tooltip"
          className="fixed z-50 w-60 rounded-xp-lg border border-border bg-surface-raised p-3 shadow-xp-md"
          style={{ top: position.top, left: position.left }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Split · {members.length} member{members.length === 1 ? '' : 's'}
          </p>
          <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
            {members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="min-w-0 truncate font-medium text-text-primary">
                  {member.label}
                </span>
                <Amount value={member.amount} tone="muted" className="shrink-0 text-sm" />
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center gap-1 rounded-xp-md px-1 py-0.5 text-left transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        onClick={togglePopover}
        onMouseEnter={() => {
          if (window.matchMedia('(hover: hover)').matches) {
            showPopover()
          }
        }}
        onMouseLeave={() => {
          if (window.matchMedia('(hover: hover)').matches) {
            hidePopover()
          }
        }}
      >
        <span className="inline-flex items-center -space-x-1.5">
          {visible.map((member, index) => {
            const colors = memberInitialColor(index)
            return (
              <span
                key={member.userId}
                className="inline-flex h-6 w-6 items-center justify-center rounded-xp-full border-2 border-surface-raised text-[10px] font-semibold"
                style={{ backgroundColor: colors.bg, color: colors.fg }}
                title={member.label}
              >
                {member.initials}
              </span>
            )
          })}
        </span>
        {overflow > 0 && (
          <span className="rounded-xp-full bg-surface-subtle px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">
            +{overflow}
          </span>
        )}
      </button>
      {popover}
    </>
  )
}
