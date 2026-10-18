import { useProjectActivity } from '../hooks/useProjectActivity'
import type { ActivityAction, ActivityLog } from '../types'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`

  return `${Math.floor(seconds / 86400)}d ago`
}

const actionConfig: Record<ActivityAction, { label: string; icon: string; badgeClass: string }> = {
  TASK_CREATED: {
    label: 'Created',
    icon: '+',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  TASK_STATUS_CHANGED: {
    label: 'Moved',
    icon: '⇄',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  TASK_PRIORITY_CHANGED: {
    label: 'Priority',
    icon: '▲',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  TASK_ASSIGNEE_CHANGED: {
    label: 'Assigned',
    icon: '👤',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  TASK_DELETED: {
    label: 'Deleted',
    icon: '✕',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  COMMENT_CREATED: {
    label: 'Comment',
    icon: '💬',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  TASK_UPDATED: {
    label: 'Updated',
    icon: '✎',
    badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',
  },
}

function renderDescription(activity: ActivityLog) {
  const { action, metadata } = activity
  const title = (metadata?.taskTitle as string) || 'a task'

  switch (action) {
    case 'TASK_CREATED':
      return (
        <span>
          created task <span className="font-semibold text-gray-900">"{title}"</span>
        </span>
      )
    case 'TASK_STATUS_CHANGED':
      return (
        <span>
          moved <span className="font-semibold text-gray-900">"{title}"</span> from{' '}
          <span className="font-medium text-gray-600">{metadata?.oldStatus as string}</span> to{' '}
          <span className="font-semibold text-indigo-600">{metadata?.newStatus as string}</span>
        </span>
      )
    case 'TASK_PRIORITY_CHANGED':
      return (
        <span>
          changed priority of <span className="font-semibold text-gray-900">"{title}"</span> to{' '}
          <span className="font-semibold text-orange-600">{metadata?.newPriority as string}</span>
        </span>
      )
    case 'TASK_ASSIGNEE_CHANGED':
      return (
        <span>
          assigned <span className="font-semibold text-gray-900">"{title}"</span> to{' '}
          <span className="font-semibold text-gray-900">{metadata?.assigneeName as string}</span>
        </span>
      )
    case 'TASK_DELETED':
      return (
        <span>
          deleted task <span className="font-semibold text-gray-900">"{title}"</span>
        </span>
      )
    case 'COMMENT_CREATED':
      return (
        <div className="space-y-1">
          <span>
            commented on <span className="font-semibold text-gray-900">"{title}"</span>
          </span>
          {Boolean(metadata?.preview) && (
            <p className="rounded bg-gray-50 p-2 text-xs italic text-gray-600 border border-gray-100">
              "{metadata?.preview as string}"
            </p>
          )}
        </div>
      )
    case 'TASK_UPDATED':
    default:
      return (
        <span>
          updated task <span className="font-semibold text-gray-900">"{title}"</span>
        </span>
      )
  }
}

type ActivityTimelineProps = {
  projectId: string
  projectName: string
}

export function ActivityTimeline({ projectId, projectName }: ActivityTimelineProps) {
  const { data: activities = [], isLoading, error } = useProjectActivity(projectId)

  if (isLoading) {
    return <p className="text-sm text-gray-500 py-8">Loading activity feed...</p>
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-600">
        Failed to load activity logs.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Audit Trail</h3>
          <p className="text-xs text-gray-500">History of events in {projectName}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
          {activities.length} events
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center text-xs text-gray-400">
          No activity recorded yet for this project.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-100">
          {activities.map((activity) => {
            const config = actionConfig[activity.action] || actionConfig.TASK_UPDATED

            return (
              <div key={activity.id} className="relative flex items-start gap-3">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold shadow-2xs ${config.badgeClass}`}
                >
                  {config.icon}
                </div>

                {/* Actor Avatar */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                  {getInitials(activity.actor.name)}
                </div>

                {/* Content */}
                <div className="flex-1 rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-900">
                      {activity.actor.name}
                    </span>
                    <span
                      title={new Date(activity.createdAt).toLocaleString()}
                      className="text-[10px] text-gray-400"
                    >
                      {timeAgo(activity.createdAt)}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-gray-700 leading-relaxed">
                    {renderDescription(activity)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
