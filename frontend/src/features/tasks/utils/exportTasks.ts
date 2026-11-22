import type { Task } from '../types'

/**
 * Escapes a cell value according to RFC 4180 standard for CSV.
 * - Wraps in double quotes if it contains commas, double quotes, or line breaks.
 * - Double quotes inside the text are escaped as two double quotes ("").
 */
function escapeCSVValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '""'
  }

  const str = String(value)
  // Check if string contains comma, quote, or newline
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return `"${str}"`
}

/**
 * Generates a clean URL-friendly and filesystem-safe filename string.
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Formats a Date object to YYYY-MM-DD for filename tagging.
 */
function getFormattedDateStamp(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/**
 * Triggers a browser download using a Blob and temporary Anchor element.
 * Safely revokes the object URL afterwards to avoid memory leaks.
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exports tasks as an RFC 4180 compliant CSV file with UTF-8 BOM encoding for Excel compatibility.
 */
export function exportTasksToCSV(tasks: Task[], projectName: string): void {
  const headers = [
    'Task ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Assignee Name',
    'Assignee Email',
    'Due Date',
    'Labels',
    'Created At',
    'Updated At',
  ]

  const rows = tasks.map((task) => {
    const labelsStr = task.taskLabels?.map((tl) => tl.label.name).join(', ') ?? ''
    const dueDateStr = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''

    return [
      escapeCSVValue(task.id),
      escapeCSVValue(task.title),
      escapeCSVValue(task.description ?? ''),
      escapeCSVValue(task.status),
      escapeCSVValue(task.priority),
      escapeCSVValue(task.assignee?.name ?? 'Unassigned'),
      escapeCSVValue(task.assignee?.email ?? ''),
      escapeCSVValue(dueDateStr),
      escapeCSVValue(labelsStr),
      escapeCSVValue(new Date(task.createdAt).toLocaleString()),
      escapeCSVValue(new Date(task.updatedAt).toLocaleString()),
    ].join(',')
  })

  // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows recognizes UTF-8 properly (emojis, accents, etc.)
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const filename = `${sanitizeFilename(projectName)}-tasks-${getFormattedDateStamp()}.csv`

  triggerDownload(blob, filename)
}

/**
 * Exports tasks as a clean, structured JSON file with export metadata.
 */
export function exportTasksToJSON(tasks: Task[], projectName: string): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    projectName,
    totalTasks: tasks.length,
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
      dueDate: task.dueDate,
      labels:
        task.taskLabels?.map((tl) => ({
          id: tl.label.id,
          name: tl.label.name,
          color: tl.label.color,
        })) ?? [],
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })),
  }

  const jsonContent = JSON.stringify(payload, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const filename = `${sanitizeFilename(projectName)}-tasks-${getFormattedDateStamp()}.json`

  triggerDownload(blob, filename)
}
