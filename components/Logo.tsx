export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { container: 'h-8', text: 'text-xl' },
    md: { container: 'h-10', text: 'text-2xl' },
    lg: { container: 'h-12', text: 'text-3xl' }
  }

  const { container, text } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${container}`}>
      {/* Icon - represents accountability/tracking with checkmark and circular design */}
      <svg
        className={container}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle with Irish green accent */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="#059669"
          fillOpacity="0.1"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="#059669"
          strokeWidth="2"
        />

        {/* Check/tick mark symbolizing accountability */}
        <path
          d="M12 20 L17 25 L28 14"
          stroke="#059669"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Small dots representing tracking/monitoring */}
        <circle cx="20" cy="8" r="1.5" fill="#059669" />
        <circle cx="20" cy="32" r="1.5" fill="#059669" />
      </svg>

      {/* Wordmark */}
      <span className={`font-bold ${text} text-gray-900`}>
        Fiacha
      </span>
    </div>
  )
}
