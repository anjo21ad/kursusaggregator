interface StatusBadgeProps {
  status: string
  type: 'course' | 'provider' | 'lead'
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const getColorClasses = () => {
    if (type === 'course') {
      switch (status) {
        case 'PUBLISHED':
          return 'bg-success/20 text-success border-success/30'
        case 'PENDING_REVIEW':
          return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        case 'DRAFT':
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        case 'ARCHIVED':
          return 'bg-red-500/20 text-red-400 border-red-500/30'
        default:
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      }
    }

    if (type === 'provider') {
      switch (status) {
        case 'APPROVED':
          return 'bg-success/20 text-success border-success/30'
        case 'PENDING':
          return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        case 'SUSPENDED':
          return 'bg-red-500/20 text-red-400 border-red-500/30'
        case 'REJECTED':
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        default:
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      }
    }

    if (type === 'lead') {
      switch (status) {
        case 'NEW':
          return 'bg-primary/20 text-primary border-primary/30'
        case 'CONTACTED':
          return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        case 'CONVERTED':
          return 'bg-success/20 text-success border-success/30'
        case 'CLOSED':
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        default:
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      }
    }

    return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const getLabel = () => {
    // Danish labels
    const labels: Record<string, string> = {
      // Course statuses
      PUBLISHED: 'Udgivet',
      PENDING_REVIEW: 'Afventer godkendelse',
      DRAFT: 'Kladde',
      ARCHIVED: 'Arkiveret',

      // Provider statuses
      APPROVED: 'Godkendt',
      PENDING: 'Afventer',
      SUSPENDED: 'Suspenderet',
      REJECTED: 'Afvist',

      // Lead statuses
      NEW: 'Ny',
      CONTACTED: 'Kontaktet',
      CONVERTED: 'Konverteret',
      CLOSED: 'Lukket',
    }

    return labels[status] || status
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClasses()}`}
    >
      {getLabel()}
    </span>
  )
}
