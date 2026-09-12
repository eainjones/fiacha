'use client'

import { PoliticalParty, PartyBadgeProps } from '@/types/party'
import Image from 'next/image'

/**
 * PartyBadge - Display a political party with its color scheme and optional icon
 *
 * Features:
 * - Party-specific background and text colors
 * - Optional party icon display
 * - Responsive sizing (sm/md/lg)
 * - Shows full name or abbreviation
 * - Fallback for null/missing party data
 */
export default function PartyBadge({
  party,
  showIcon = false,
  showFullName = false,
  size = 'md',
  className = ''
}: PartyBadgeProps) {
  // Handle null/missing party
  if (!party) {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 ${className}`}>
        Unknown
      </span>
    )
  }

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const displayText = showFullName ? party.name : party.abbreviation

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: party.color,
        color: party.text_color
      }}
      title={showFullName ? party.abbreviation : party.name}
    >
      {showIcon && party.icon_url && (
        <Image
          src={party.icon_url}
          alt={`${party.name} icon`}
          width={16}
          height={16}
          className={`${iconSizes[size]} object-contain`}
        />
      )}
      {showIcon && !party.icon_url && (
        <span className={`${iconSizes[size]} inline-block rounded-full border-2 border-current opacity-50`} />
      )}
      <span>{displayText}</span>
    </span>
  )
}
