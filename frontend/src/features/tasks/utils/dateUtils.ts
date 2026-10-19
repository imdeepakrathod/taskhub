export function formatDueDate(dateStr: string): {
  text: string
  status: 'overdue' | 'today' | 'tomorrow' | 'upcoming'
} {
  const target = new Date(dateStr)
  const now = new Date()

  // Reset hours to compare purely by calendar day
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffTime = targetDay.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays)

    return {
      text: overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`,
      status: 'overdue',
    }
  }

  if (diffDays === 0) {
    return { text: 'Due today', status: 'today' }
  }

  if (diffDays === 1) {
    return { text: 'Due tomorrow', status: 'tomorrow' }
  }

  // Format as "Due Oct 25"
  const formattedDate = target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return { text: `Due ${formattedDate}`, status: 'upcoming' }
}
