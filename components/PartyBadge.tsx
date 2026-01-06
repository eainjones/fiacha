interface PartyBadgeProps {
  party: string
  color?: string | null  // Hex color from database (e.g., '#16A34A')
  shortName?: string | null
  size?: 'sm' | 'md' | 'lg'
}

// Fallback Tailwind colors when no database color is available
const PARTY_COLORS: { [key: string]: { bg: string; text: string; border: string } } = {
  'Fianna Fáil': { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' },
  'Fine Gael': { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
  'Sinn Féin': { bg: 'bg-emerald-700', text: 'text-white', border: 'border-emerald-800' },
  'Labour': { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' },
  'Labour Party': { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' },
  'Green Party': { bg: 'bg-lime-600', text: 'text-white', border: 'border-lime-700' },
  'Social Democrats': { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' },
  'People Before Profit': { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700' },
  'People Before Profit-Solidarity': { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700' },
  'People Before Profit Alliance': { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700' },
  'Aontú': { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700' },
  'Independent Ireland': { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-700' },
  'Independent': { bg: 'bg-gray-600', text: 'text-white', border: 'border-gray-700' },
  'Wexford Independent Alliance': { bg: 'bg-gray-600', text: 'text-white', border: 'border-gray-700' },
  'Ceann Comhairle': { bg: 'bg-slate-700', text: 'text-white', border: 'border-slate-800' },
  '100% Redress Party': { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-700' },
  'Workers and Unemployed Action': { bg: 'bg-red-700', text: 'text-white', border: 'border-red-800' },
  // Northern Ireland parties
  'Democratic Unionist Party': { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' },
  'Ulster Unionist Party': { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
  'Alliance Party': { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600' },
  'Social Democratic and Labour Party': { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' },
  'Traditional Unionist Voice': { bg: 'bg-blue-900', text: 'text-white', border: 'border-blue-950' },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
}

// Darken a hex color by a percentage for border
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100))
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100))
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

export default function PartyBadge({ party, color, shortName, size = 'md' }: PartyBadgeProps) {
  if (!party) return null

  const displayName = shortName || party

  // If database color provided, use inline styles
  if (color) {
    const borderColor = darkenColor(color, 15)
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full border-2 text-white ${SIZE_CLASSES[size]}`}
        style={{ backgroundColor: color, borderColor }}
        title={party}
      >
        {displayName}
      </span>
    )
  }

  // Fall back to Tailwind class-based colors
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
      {displayName}
    </span>
  )
}
