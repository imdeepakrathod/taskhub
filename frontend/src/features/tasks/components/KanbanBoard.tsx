import { useState } from 'react'

import { useTaskMutations } from '../hooks/useTaskMutations'
import { useTasks } from '../hooks/useTasks'
import type { TaskStatus } from '../types'
import { CreateTaskModal } from './CreateTaskModal'
import { TaskCard } from './TaskCard'

const COLUMNS: { id: TaskStatus; label: string; dotColor: string }[] = [
  { id: 'TODO', label: 'To Do', dotColor: 'bg-gray-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', dotColor: 'bg-blue-500' },
  { id: 'IN_REVIEW', label: 'In Review', dotColor: 'bg-purple-500' },
  { id: 'DONE', label: 'Done', dotColor: 'bg-green-500' },
]

type KanbanBoardProps = {
  projectId: string
  projectName: string
  onBack: () => void
}

export function KanbanBoard({ projectId, projectName, onBack }: KanbanBoardProps) {
  const { data: tasks = [], isLoading, error } = useTasks(projectId)
  const { createTask, updateTask, deleteTask } = useTaskMutations(projectId)

  const [modalOpen, setModalOpen] = useState(false)
  const [targetColumn, setTargetColumn] = useState<TaskStatus>('TODO')

  const openCreateForColumn = (status: TaskStatus) => {
    setTargetColumn(status)
    setModalOpen(true)
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    void updateTask({ taskId, input: { status } })
  }

  const handleDelete = (taskId: string) => {
    void deleteTask(taskId)
  }

  return (
    <div className="space-y-6">
      {/* Header with Back button and Actions */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition"
          >
            ← Back to Projects
          </button>
          <h2 className="text-xl font-bold text-gray-900">{projectName} Board</h2>
        </div>

        <button
          onClick={() => openCreateForColumn('TODO')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
        >
          + Add Task
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading board tasks...</p>}
      {error && <p className="text-sm text-red-500">Failed to load tasks.</p>}

      {/* 4-Column Board */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-xl border border-gray-200 bg-gray-50/70 p-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                  <span className="font-semibold text-sm text-gray-800">{col.label}</span>
                  <span className="rounded-full bg-gray-200/80 px-2 py-0.5 text-xs font-semibold text-gray-600">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openCreateForColumn(col.id)}
                  title="Add task to column"
                  className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 text-sm transition"
                >
                  +
                </button>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-2.5 min-h-[300px]">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}

                {colTasks.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <CreateTaskModal
        isOpen={modalOpen}
        defaultStatus={targetColumn}
        onClose={() => setModalOpen(false)}
        onSubmitTask={async (data) => {
          await createTask(data)
        }}
      />
    </div>
  )
}
