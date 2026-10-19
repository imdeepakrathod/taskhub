import { formatDueDate } from '../utils/dateUtils'

type DueDateBadgeProps = {
  dueDate: string
  isDone?: boolean
}

export function DueDateBadge({ dueDate, isDone = false }: DueDateBadgeProps) {
  const { text, status } = formatDueDate(dueDate)

  if (isDone) {
    const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    return (
      <span className="inline-flex items-center gap-1 rounded bg-gray-50 border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
        <span>📅</span>
        <span>{formattedDate}</span>
      </span>
    )
  }

  const badgeStyles = {
    overdue: 'bg-red-50 border-red-200 text-red-700 font-semibold',
    today: 'bg-amber-50 border-amber-200 text-amber-700 font-semibold',
    tomorrow: 'bg-amber-50/70 border-amber-200 text-amber-700',
    upcoming: 'bg-gray-50 border-gray-200 text-gray-600',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] ${badgeStyles[status]}`}
    >
      <span>📅</span>
      <span>{text}</span>
    </span>
  )
}
