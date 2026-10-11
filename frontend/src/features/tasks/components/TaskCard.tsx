import type { Task, TaskPriority, TaskStatus } from '../types'

const priorityStyles: Record<TaskPriority, string> = {
  LOW: 'bg-gray-100 text-gray-700 border-gray-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  URGENT: 'bg-red-50 text-red-700 border-red-200 font-semibold',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type TaskCardProps = {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
  onClick: (task: Task) => void
}

export function TaskCard({ task, onStatusChange, onDelete, onClick }: TaskCardProps) {
  return (
    <div
      onClick={() => onClick(task)}
      className="group rounded-lg border border-gray-200 bg-white p-3.5 shadow-2xs hover:border-indigo-300 hover:shadow-xs cursor-pointer transition"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm text-gray-900 leading-snug">{task.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task.id)
          }}
          title="Delete task"
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 text-xs transition"
        >
          ✕
        </button>
      </div>

      {task.description && (
        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
              priorityStyles[task.priority]
            }`}
          >
            {task.priority.toLowerCase()}
          </span>

          {task.assignee && (
            <span
              title={`Assigned to ${task.assignee.name}`}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-700 border border-indigo-200"
            >
              {getInitials(task.assignee.name)}
            </span>
          )}
        </div>

        <select
          value={task.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation()
            onStatusChange(task.id, e.target.value as TaskStatus)
          }}
          className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>
      </div>
    </div>
  )
}
