interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<string, {
  label: string
  icon: string
  className: string
}> = {
  kept: {
    label: 'Kept',
    icon: '✓',
    className: 'status-kept',
  },
  broken: {
    label: 'Broken',
    icon: '✗',
    className: 'status-broken',
  },
  pending: {
    label: 'Pending',
    icon: '○',
    className: 'status-pending',
  },
  in_progress: {
    label: 'In Progress',
    icon: '◐',
    className: 'status-in-progress',
  },
  compromised: {
    label: 'Compromised',
    icon: '⚠',
    className: 'status-compromised',
  },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'

  return (
    <span className={`status-badge ${config.className} ${sizeClasses}`}>
      <span className="font-mono" aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

// For use in tables or where just the icon is needed
export function StatusIcon({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${config.className}`}
      title={config.label}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span className="sr-only">{config.label}</span>
    </span>
  )
}
