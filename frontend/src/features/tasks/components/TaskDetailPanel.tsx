import { useAuth } from '../../auth/hooks/useAuth'
import { CommentThread } from '../../comments'
import { LabelBadge, useLabelMutations, useLabels } from '../../labels'
import type { Member } from '../../members/types'
import { useTaskMutations } from '../hooks/useTaskMutations'
import type { Task, TaskPriority, TaskStatus } from '../types'
import { DueDateBadge } from './DueDateBadge'

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
  workspaceId: string
  members: Member[]
  onClose: () => void
}

export function TaskDetailPanel({
  task,
  projectId,
  workspaceId,
  members,
  onClose,
}: TaskDetailPanelProps) {
  const { user } = useAuth()
  const { updateTask } = useTaskMutations(projectId)
  const { data: allLabels = [] } = useLabels(workspaceId)
  const { attachLabel, detachLabel } = useLabelMutations(workspaceId, projectId)

  const attachedLabelIds = new Set(task.taskLabels?.map((tl) => tl.label.id) ?? [])
  const unattachedLabels = allLabels.filter((l) => !attachedLabelIds.has(l.id))

  const handleStatusChange = (status: TaskStatus) => {
    void updateTask({ taskId: task.id, input: { status } })
  }

  const handlePriorityChange = (priority: TaskPriority) => {
    void updateTask({ taskId: task.id, input: { priority } })
  }

  const handleAssigneeChange = (assigneeId: string) => {
    void updateTask({
      taskId: task.id,
      input: { assigneeId: assigneeId || null },
    })
  }

  const handleDueDateChange = (dateStr: string) => {
    void updateTask({
      taskId: task.id,
      input: { dueDate: dateStr ? new Date(dateStr).toISOString() : null },
    })
  }

  const handleAttachLabel = (labelId: string) => {
    if (!labelId) return
    void attachLabel({ taskId: task.id, labelId })
  }

  const handleDetachLabel = (labelId: string) => {
    void detachLabel({ taskId: task.id, labelId })
  }

  // Convert ISO string to YYYY-MM-DD for date input
  const dateInputValue = task.dueDate ? task.dueDate.split('T')[0] : ''

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900 truncate pr-4">Task Details</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 leading-snug">{task.title}</h3>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Assignee
                </label>
                <select
                  value={task.assigneeId ?? ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Due Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateInputValue}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {task.dueDate && (
                    <button
                      type="button"
                      onClick={() => handleDueDateChange('')}
                      title="Clear due date"
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Timeline Status:
                </span>
                <DueDateBadge dueDate={task.dueDate} isDone={task.status === 'DONE'} />
              </div>
            )}

            {/* Labels Section */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Labels & Tags
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {task.taskLabels?.map(({ label }) => (
                  <LabelBadge
                    key={label.id}
                    name={label.name}
                    color={label.color}
                    onRemove={() => handleDetachLabel(label.id)}
                  />
                ))}

                {unattachedLabels.length > 0 && (
                  <select
                    onChange={(e) => {
                      handleAttachLabel(e.target.value)
                      e.target.value = ''
                    }}
                    defaultValue=""
                    className="rounded border border-dashed border-gray-300 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="" disabled>
                      + Add label
                    </option>
                    {unattachedLabels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Priority Indicator:
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${priorityDotColors[task.priority]}`} />
                <span className="font-medium text-gray-700">{priorityLabels[task.priority]}</span>
              </div>
            </div>

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

            <div className="flex gap-6 text-[11px] text-gray-400 pt-2">
              <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="px-6 py-5">
            <CommentThread taskId={task.id} currentUserId={user?.id ?? ''} />
          </div>
        </div>
      </div>
    </>
  )
}
