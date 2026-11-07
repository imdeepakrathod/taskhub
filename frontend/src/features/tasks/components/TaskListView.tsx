import type { Member } from '../../members/types'
import { LabelBadge } from '../../labels'
import type { Task, TaskPriority, TaskStatus, UpdateTaskInput } from '../types'
import { DueDateBadge } from './DueDateBadge'

const statusOptions: Record<TaskStatus, { label: string; color: string }> = {
  BACKLOG: { label: 'Backlog', color: 'bg-gray-100 text-gray-700' },
  TODO: { label: 'To Do', color: 'bg-slate-100 text-slate-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'In Review', color: 'bg-purple-100 text-purple-700' },
  DONE: { label: 'Done', color: 'bg-green-100 text-green-700' },
}

const priorityOptions: Record<TaskPriority, { label: string; dot: string }> = {
  LOW: { label: 'Low', dot: 'bg-gray-400' },
  MEDIUM: { label: 'Medium', dot: 'bg-blue-500' },
  HIGH: { label: 'High', dot: 'bg-orange-500' },
  URGENT: { label: 'Urgent', dot: 'bg-red-500' },
}

type TaskListViewProps = {
  tasks: Task[]
  members: Member[]
  onSelectTask: (task: Task) => void
  onUpdateTask: (taskId: string, input: UpdateTaskInput) => void
}

export function TaskListView({ tasks, members, onSelectTask, onUpdateTask }: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-center">
        <span className="text-2xl mb-1">📋</span>
        <p className="text-sm font-medium text-gray-700">No tasks found</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Try adjusting your filters or create a new task.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="py-3 px-4">Task Title</th>
              <th className="py-3 px-3 w-36">Status</th>
              <th className="py-3 px-3 w-32">Priority</th>
              <th className="py-3 px-3 w-40">Assignee</th>
              <th className="py-3 px-3 w-32">Due Date</th>
              <th className="py-3 px-3">Labels</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="group hover:bg-gray-50/60 transition cursor-pointer"
                onClick={() => onSelectTask(task)}
              >
                {/* Title */}
                <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">
                  <span className="hover:text-indigo-600 transition">{task.title}</span>
                </td>

                {/* Status Dropdown */}
                <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      onUpdateTask(task.id, { status: e.target.value as TaskStatus })
                    }
                    className={`rounded-md border border-transparent px-2 py-1 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      statusOptions[task.status].color
                    }`}
                  >
                    {Object.entries(statusOptions).map(([key, opt]) => (
                      <option key={key} value={key} className="bg-white text-gray-900 font-normal">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Priority Dropdown */}
                <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${priorityOptions[task.priority].dot}`}
                    />
                    <select
                      value={task.priority}
                      onChange={(e) =>
                        onUpdateTask(task.id, { priority: e.target.value as TaskPriority })
                      }
                      className="rounded border border-gray-200 bg-transparent px-1.5 py-0.5 text-xs text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {Object.entries(priorityOptions).map(([key, opt]) => (
                        <option key={key} value={key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* Assignee */}
                <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={task.assigneeId ?? ''}
                    onChange={(e) => onUpdateTask(task.id, { assigneeId: e.target.value || null })}
                    className="max-w-[140px] truncate rounded border border-gray-200 bg-transparent px-1.5 py-0.5 text-xs text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Due Date */}
                <td className="py-2.5 px-3">
                  {task.dueDate ? (
                    <DueDateBadge dueDate={task.dueDate} isDone={task.status === 'DONE'} />
                  ) : (
                    <span className="text-gray-300 italic text-[11px]">No date</span>
                  )}
                </td>

                {/* Labels */}
                <td className="py-2.5 px-3">
                  <div className="flex flex-wrap gap-1">
                    {task.taskLabels && task.taskLabels.length > 0 ? (
                      task.taskLabels
                        .slice(0, 2)
                        .map(({ label }) => (
                          <LabelBadge key={label.id} name={label.name} color={label.color} />
                        ))
                    ) : (
                      <span className="text-gray-300 text-[11px]">—</span>
                    )}
                    {task.taskLabels && task.taskLabels.length > 2 && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        +{task.taskLabels.length - 2}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
