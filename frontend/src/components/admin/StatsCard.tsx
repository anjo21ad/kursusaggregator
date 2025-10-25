interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  color?: 'primary' | 'secondary' | 'success' | 'warning'
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary'
}: StatsCardProps) {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/30 text-secondary',
    success: 'from-success/20 to-success/5 border-success/30 text-success',
    warning: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400',
  }

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 hover:scale-105 transition-transform`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-dark-text-secondary mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-dark-text-secondary mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>

      {trend && (
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`font-semibold ${
              trend.positive ?? trend.value > 0 ? 'text-success' : 'text-red-400'
            }`}
          >
            {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-dark-text-secondary">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
