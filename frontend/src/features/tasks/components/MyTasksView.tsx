import { useMemo, useState } from 'react'

import { LabelBadge } from '../../labels'
import type { MyTask } from '../api/myTasksApi'
import { useMyTasks } from '../hooks/useMyTasks'
import type { Task, TaskPriority, TaskStatus } from '../types'
import { DueDateBadge } from './DueDateBadge'

type MyTasksViewProps = {
  workspaceId: string
  onSelectTask: (task: Task) => void
}

type FilterTab = 'all' | 'due' | 'done'

const priorityDots: Record<TaskPriority, string> = {
  LOW: 'bg-gray-400',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
}

const statusColors: Record<TaskStatus, string> = {
  BACKLOG: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  TODO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  IN_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  DONE: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300',
}

export function MyTasksView({ workspaceId, onSelectTask }: MyTasksViewProps) {
  const { data: tasks = [], isLoading } = useMyTasks(workspaceId)
  const [filter, setFilter] = useState<FilterTab>('all')

  const todayEndTime = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime()
  }, [])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === 'done') return t.status === 'DONE'
      if (filter === 'due') {
        if (t.status === 'DONE') return false
        if (!t.dueDate) return false
        return new Date(t.dueDate).getTime() <= todayEndTime
      }
      return t.status !== 'DONE'
    })
  }, [tasks, filter, todayEndTime])

  // Group by Project
  const tasksByProject = useMemo(() => {
    const map = new Map<string, { projectName: string; tasks: MyTask[] }>()
    for (const t of filteredTasks) {
      const existing = map.get(t.projectId) ?? { projectName: t.project.name, tasks: [] }
      existing.tasks.push(t)
      map.set(t.projectId, existing)
    }
    return map
  }, [filteredTasks])

  const overdueCount = useMemo(() => {
    return tasks.filter(
      (t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate).getTime() <= todayEndTime,
    ).length
  }, [tasks, todayEndTime])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>🎯</span>
            <span>My Tasks</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All tasks assigned to you across this workspace
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Active ({tasks.filter((t) => t.status !== 'DONE').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('due')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
              filter === 'due'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <span>🚨 Due Soon / Overdue</span>
            {overdueCount > 0 && (
              <span className="rounded-full bg-red-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {overdueCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilter('done')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
              filter === 'done'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Completed ({tasks.filter((t) => t.status === 'DONE').length})
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading your tasks...</p>}

      {!isLoading && filteredTasks.length === 0 && (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-center p-6">
          <span className="text-3xl mb-2">🎉</span>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {filter === 'due'
              ? 'No overdue tasks! You are completely on track.'
              : filter === 'done'
                ? 'No completed tasks yet.'
                : 'Zero tasks assigned to you. Enjoy your day!'}
          </p>
        </div>
      )}

      {/* Grouped by Project */}
      <div className="space-y-6">
        {Array.from(tasksByProject.entries()).map(
          ([projId, { projectName, tasks: projectTasks }]) => (
            <div
              key={projId}
              className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs"
            >
              {/* Project Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs">📁</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {projectName}
                  </span>
                  <span className="rounded-full bg-gray-200/80 dark:bg-gray-700 px-2 py-0.2 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                    {projectTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Rows */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {projectTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="flex items-center justify-between p-3.5 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition cursor-pointer gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${priorityDots[task.priority]}`}
                      />
                      <span
                        className={`text-xs font-semibold truncate ${
                          task.status === 'DONE'
                            ? 'text-gray-400 line-through'
                            : 'text-gray-900 dark:text-gray-100 hover:text-indigo-600'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Labels */}
                      <div className="hidden sm:flex items-center gap-1">
                        {task.taskLabels?.slice(0, 2).map(({ label }) => (
                          <LabelBadge key={label.id} name={label.name} color={label.color} />
                        ))}
                      </div>

                      {/* Due Date */}
                      {task.dueDate && (
                        <DueDateBadge dueDate={task.dueDate} isDone={task.status === 'DONE'} />
                      )}

                      {/* Status Pill */}
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          statusColors[task.status]
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
