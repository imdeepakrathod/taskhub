import { useMemo, useState } from 'react'

import { ManageLabelsModal, useLabels } from '../../labels'
import { useMembers } from '../../members/hooks/useMembers'
import { useTaskMutations } from '../hooks/useTaskMutations'
import { useTasks } from '../hooks/useTasks'
import type { Task, TaskPriority, TaskStatus } from '../types'
import { CreateTaskModal } from './CreateTaskModal'
import { TaskCard } from './TaskCard'
import { TaskDetailPanel } from './TaskDetailPanel'

const COLUMNS: { id: TaskStatus; label: string; dotColor: string }[] = [
  { id: 'TODO', label: 'To Do', dotColor: 'bg-gray-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', dotColor: 'bg-blue-500' },
  { id: 'IN_REVIEW', label: 'In Review', dotColor: 'bg-purple-500' },
  { id: 'DONE', label: 'Done', dotColor: 'bg-green-500' },
]

type KanbanBoardProps = {
  projectId: string
  projectName: string
  workspaceId: string
  onBack: () => void
}

export function KanbanBoard({ projectId, projectName, workspaceId, onBack }: KanbanBoardProps) {
  const { data: tasks = [], isLoading, error } = useTasks(projectId)
  const { data: members = [] } = useMembers(workspaceId)
  const { data: labels = [] } = useLabels(workspaceId)
  const { createTask, updateTask, deleteTask } = useTaskMutations(projectId)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'ALL'>('ALL')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL')
  const [selectedLabel, setSelectedLabel] = useState<string>('ALL')

  const [modalOpen, setModalOpen] = useState(false)
  const [labelsModalOpen, setLabelsModalOpen] = useState(false)
  const [targetColumn, setTargetColumn] = useState<TaskStatus>('TODO')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Client-side filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = task.title.toLowerCase().includes(query)
        const matchDesc = task.description?.toLowerCase().includes(query) ?? false

        if (!matchTitle && !matchDesc) return false
      }

      // 2. Priority Filter
      if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) {
        return false
      }

      // 3. Assignee Filter
      if (selectedAssignee === 'UNASSIGNED') {
        if (task.assigneeId !== null) return false
      } else if (selectedAssignee !== 'ALL') {
        if (task.assigneeId !== selectedAssignee) return false
      }

      // 4. Label Filter
      if (selectedLabel !== 'ALL') {
        const hasLabel = task.taskLabels?.some((tl) => tl.label.id === selectedLabel)
        if (!hasLabel) return false
      }

      return true
    })
  }, [tasks, searchQuery, selectedPriority, selectedAssignee, selectedLabel])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedPriority !== 'ALL' ||
    selectedAssignee !== 'ALL' ||
    selectedLabel !== 'ALL'

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedPriority('ALL')
    setSelectedAssignee('ALL')
    setSelectedLabel('ALL')
  }

  const openCreateForColumn = (status: TaskStatus) => {
    setTargetColumn(status)
    setModalOpen(true)
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    void updateTask({ taskId, input: { status } })
  }

  const handleDelete = (taskId: string) => {
    if (selectedTask?.id === taskId) {
      setSelectedTask(null)
    }
    void deleteTask(taskId)
  }

  const activeTask = selectedTask
    ? (tasks.find((t) => t.id === selectedTask.id) ?? selectedTask)
    : null

  return (
    <div className="space-y-5">
      {/* Header */}
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

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLabelsModalOpen(true)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition"
          >
            🏷️ Labels
          </button>
          <button
            onClick={() => openCreateForColumn('TODO')}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'ALL')}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned</option>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>

          {/* Label Filter */}
          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Labels</option>
            {labels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading board tasks...</p>}
      {error && <p className="text-sm text-red-500">Failed to load tasks.</p>}

      {/* 4-Column Board */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id)

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-xl border border-gray-200 bg-gray-50/70 p-3"
            >
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

              <div className="flex-1 space-y-2.5 min-h-[300px]">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onClick={setSelectedTask}
                  />
                ))}

                {colTasks.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
                    {hasActiveFilters ? 'No matching tasks' : 'No tasks'}
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
        members={members}
        onClose={() => setModalOpen(false)}
        onSubmitTask={async (data) => {
          await createTask(data)
        }}
      />

      <ManageLabelsModal
        isOpen={labelsModalOpen}
        workspaceId={workspaceId}
        onClose={() => setLabelsModalOpen(false)}
      />

      {activeTask && (
        <TaskDetailPanel
          task={activeTask}
          projectId={projectId}
          workspaceId={workspaceId}
          members={members}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}
