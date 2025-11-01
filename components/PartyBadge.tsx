interface PartyBadgeProps {
  party: string
  size?: 'sm' | 'md' | 'lg'
}

const PARTY_COLORS: { [key: string]: { bg: string; text: string; border: string } } = {
  'Fianna Fáil': {
    bg: 'bg-green-600',
    text: 'text-white',
    border: 'border-green-700',
  },
  'Fine Gael': {
    bg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-blue-700',
  },
  'Sinn Féin': {
    bg: 'bg-emerald-700',
    text: 'text-white',
    border: 'border-emerald-800',
  },
  'Labour': {
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-700',
  },
  'Green Party': {
    bg: 'bg-lime-600',
    text: 'text-white',
    border: 'border-lime-700',
  },
  'Social Democrats': {
    bg: 'bg-purple-600',
    text: 'text-white',
    border: 'border-purple-700',
  },
  'People Before Profit': {
    bg: 'bg-rose-600',
    text: 'text-white',
    border: 'border-rose-700',
  },
  'People Before Profit-Solidarity': {
    bg: 'bg-rose-600',
    text: 'text-white',
    border: 'border-rose-700',
  },
  'Aontú': {
    bg: 'bg-amber-600',
    text: 'text-white',
    border: 'border-amber-700',
  },
  'Independent Ireland': {
    bg: 'bg-teal-600',
    text: 'text-white',
    border: 'border-teal-700',
  },
  'Independent': {
    bg: 'bg-gray-600',
    text: 'text-white',
    border: 'border-gray-700',
  },
  'Wexford Independent Alliance': {
    bg: 'bg-gray-600',
    text: 'text-white',
    border: 'border-gray-700',
  },
  'Ceann Comhairle': {
    bg: 'bg-slate-700',
    text: 'text-white',
    border: 'border-slate-800',
  },
  '100% Redress Party': {
    bg: 'bg-orange-600',
    text: 'text-white',
    border: 'border-orange-700',
  },
  'Workers and Unemployed Action': {
    bg: 'bg-red-700',
    text: 'text-white',
    border: 'border-red-800',
  },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
}

export default function PartyBadge({ party, size = 'md' }: PartyBadgeProps) {
  if (!party) return null

  const colors = PARTY_COLORS[party] || {
    bg: 'bg-gray-500',
    text: 'text-white',
    border: 'border-gray-600',
  }

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border-2 ${colors.bg} ${colors.text} ${colors.border} ${SIZE_CLASSES[size]}`}
      title={party}
    >
      {party}
    </span>
  )
}
