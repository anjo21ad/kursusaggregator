import React from 'react'

interface CourseBadgeProps {
  icon?: string
  label: string
  variant?: 'default' | 'category' | 'level' | 'location' | 'duration'
  color?: string
}

export default function CourseBadge({ icon, label, variant = 'default', color }: CourseBadgeProps) {
  const variantStyles = {
    default: 'bg-dark-hover text-dark-text-secondary',
    category: color ? '' : 'bg-primary/10 text-primary',
    level: 'bg-secondary/10 text-secondary',
    location: 'bg-accent/10 text-accent',
    duration: 'bg-dark-hover text-dark-text-secondary'
  }

  const baseStyles = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors'

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]}`}
      style={
        variant === 'category' && color
          ? {
              backgroundColor: `${color}15`,
              color: color
            }
          : undefined
      }
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </span>
  )
}
