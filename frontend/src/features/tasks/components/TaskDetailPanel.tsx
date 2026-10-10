import { useAuth } from '../../auth/hooks/useAuth'
import { CommentThread } from '../../comments'
import { useTaskMutations } from '../hooks/useTaskMutations'
import type { Task, TaskPriority, TaskStatus } from '../types'
const statusLabels: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
}

const priorityLabels: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

const priorityDotColors: Record<TaskPriority, string> = {
  LOW: 'bg-gray-400',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
}

type TaskDetailPanelProps = {
  task: Task
  projectId: string
  onClose: () => void
}

export function TaskDetailPanel({ task, projectId, onClose }: TaskDetailPanelProps) {
  const { user } = useAuth()
  const { updateTask } = useTaskMutations(projectId)

  const handleStatusChange = (status: TaskStatus) => {
    void updateTask({ taskId: task.id, input: { status } })
  }

  const handlePriorityChange = (priority: TaskPriority) => {
    void updateTask({ taskId: task.id, input: { priority } })
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900 truncate pr-4">Task Details</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Task Info Section */}
          <div className="px-6 py-5 space-y-5 border-b border-gray-100">
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 leading-snug">{task.title}</h3>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Priority
                </label>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Priority Level
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${priorityDotColors[task.priority]}`} />
                  <span className="font-medium text-gray-700">{priorityLabels[task.priority]}</span>
                </div>
              </div>

              {task.assignee && (
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Assignee
                  </span>
                  <span className="font-medium text-gray-700">{task.assignee.name}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Description
                </span>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed rounded-lg bg-gray-50 p-3 border border-gray-100">
                  {task.description}
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex gap-6 text-[11px] text-gray-400 pt-2">
              <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="px-6 py-5">
            <CommentThread taskId={task.id} currentUserId={user?.id ?? ''} />
          </div>
        </div>
      </div>
    </>
  )
}
