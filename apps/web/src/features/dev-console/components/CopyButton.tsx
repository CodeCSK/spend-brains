import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Button } from '../../../components/ui'

type CopyButtonProps = {
  value: string
  label?: string
  className?: string
}

export function CopyButton({ value, label = 'Copy', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={className}
      aria-label={copied ? 'Copied' : `${label}: ${value}`}
      onClick={() => void handleCopy()}
    >
      <Icon icon={copied ? Check : Copy} size={16} aria-hidden />
      <span className="sr-only">{copied ? 'Copied' : label}</span>
    </Button>
  )
}
