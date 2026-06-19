import type { Meta, StoryObj } from '@storybook/react'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Check,
  Download,
  Filter,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Receipt,
  RotateCcw,
  Save,
  Scale,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react'

import { Icon } from '../components/Icon'

type IconEntry = {
  name: string
  icon: LucideIcon
}

const APP_ICONS: IconEntry[] = [
  { name: 'LogIn', icon: LogIn },
  { name: 'Send', icon: Send },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'ArrowLeft', icon: ArrowLeft },
  { name: 'CalendarDays', icon: CalendarDays },
  { name: 'CalendarPlus', icon: CalendarPlus },
  { name: 'UserPlus', icon: UserPlus },
  { name: 'User', icon: User },
  { name: 'LogOut', icon: LogOut },
  { name: 'Receipt', icon: Receipt },
  { name: 'Scale', icon: Scale },
  { name: 'Users', icon: Users },
  { name: 'Settings', icon: Settings },
  { name: 'Plus', icon: Plus },
  { name: 'Save', icon: Save },
  { name: 'Pencil', icon: Pencil },
  { name: 'Trash2', icon: Trash2 },
  { name: 'Check', icon: Check },
  { name: 'X', icon: X },
  { name: 'Filter', icon: Filter },
  { name: 'Download', icon: Download },
  { name: 'Archive', icon: Archive },
  { name: 'ArchiveRestore', icon: ArchiveRestore },
  { name: 'RotateCcw', icon: RotateCcw },
]

function IconCell({ name, icon }: IconEntry) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xp-lg border border-border bg-surface-raised p-4 text-center">
      <Icon icon={icon} size={20} className="text-primary" />
      <span className="font-mono text-[10px] text-text-muted">{name}</span>
    </div>
  )
}

function IconGalleryPage() {
  const sizes = [16, 20, 24] as const

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-8">
      <header>
        <h1 className="text-2xl font-semibold text-text-label">Icon gallery</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Lucide icons wrapped by <code className="font-mono">Icon</code> for consistent sizing and
          accessibility. Default size is 20; use 24 for nav and primary actions.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-text-label">Sizes</h2>
        <div className="flex flex-wrap items-end gap-8 rounded-xp-lg border border-border bg-surface-raised p-6">
          {sizes.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <Icon icon={Receipt} size={size} className="text-primary" />
              <span className="text-xs text-text-muted">{size}px</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-text-label">App icons</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {APP_ICONS.map((entry) => (
            <IconCell key={entry.name} {...entry} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-text-label">With label (accessible)</h2>
        <div className="flex items-center gap-2 rounded-xp-lg border border-border bg-surface-raised p-4">
          <Icon icon={Trash2} size={20} label="Delete expense" className="text-error-text-strong" />
          <span className="text-sm text-text-secondary">
            Pass <code className="font-mono">label</code> when the icon conveys meaning without
            adjacent text.
          </span>
        </div>
      </section>
    </div>
  )
}

const meta = {
  title: 'Foundation/Icon Gallery',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Lucide icons used in Spendbrains, rendered via the shared Icon wrapper.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Gallery: Story = {
  render: () => <IconGalleryPage />,
}
