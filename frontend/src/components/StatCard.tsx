interface StatCardProps {
  icon: string
  label: string
  value: number | string
  trend?: {
    value: number
    positive: boolean
  }
  color?: 'primary' | 'secondary' | 'success' | 'accent'
}

export default function StatCard({ icon, label, value, trend, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    accent: 'bg-accent'
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center text-2xl`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">{label}</p>
            <p className="text-2xl font-bold text-text-light mt-1">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            trend.positive ? 'text-success' : 'text-red-400'
          }`}>
            <svg
              className={`w-4 h-4 ${trend.positive ? '' : 'rotate-180'}`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 15l7-7 7 7" />
            </svg>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
