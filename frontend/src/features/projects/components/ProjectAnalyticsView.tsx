import { useProjectAnalytics } from '../hooks/useProjectAnalytics'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type ProjectAnalyticsViewProps = {
  workspaceId: string
  projectId: string
  projectName: string
}

export function ProjectAnalyticsView({
  workspaceId,
  projectId,
  projectName,
}: ProjectAnalyticsViewProps) {
  const { data: analytics, isLoading, error } = useProjectAnalytics(workspaceId, projectId)

  if (isLoading) {
    return <p className="text-sm text-gray-500 py-8">Loading analytics for {projectName}...</p>
  }

  if (error || !analytics) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-600">
        Failed to load project analytics.
      </div>
    )
  }

  const {
    totalTasks,
    completedTasks,
    completionPercentage,
    tasksByStatus,
    tasksByPriority,
    workload,
  } = analytics

  const inProgressCount = tasksByStatus.IN_PROGRESS + tasksByStatus.IN_REVIEW
  const urgentCount = tasksByPriority.URGENT + tasksByPriority.HIGH
  const unassignedCount = workload.find((w) => w.userId === null)?.count ?? 0

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Progress Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Completion Rate
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{completionPercentage}%</span>
            <span className="text-xs text-gray-500 font-medium">
              ({completedTasks}/{totalTasks} done)
            </span>
          </div>
          <div className="mt-3.5 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Total Tasks */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Tasks
          </div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900">{totalTasks}</div>
          <p className="mt-2 text-xs text-gray-500">Across all columns</p>
        </div>

        {/* In Flight Tasks */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Active Work
          </div>
          <div className="mt-2 text-3xl font-extrabold text-blue-600">{inProgressCount}</div>
          <p className="mt-2 text-xs text-gray-500">In Progress or In Review</p>
        </div>

        {/* High / Urgent Priority */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            High & Urgent
          </div>
          <div className="mt-2 text-3xl font-extrabold text-red-600">{urgentCount}</div>
          <p className="mt-2 text-xs text-gray-500">Requiring immediate attention</p>
        </div>
      </div>

      {/* Status & Priority Visual Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Status Distribution</h3>

          <div className="space-y-3">
            {[
              { label: 'To Do', count: tasksByStatus.TODO, color: 'bg-gray-400' },
              { label: 'In Progress', count: tasksByStatus.IN_PROGRESS, color: 'bg-blue-500' },
              { label: 'In Review', count: tasksByStatus.IN_REVIEW, color: 'bg-purple-500' },
              { label: 'Done', count: tasksByStatus.DONE, color: 'bg-green-500' },
            ].map((item) => {
              const pct = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0

              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${item.color}`} />
                      {item.label}
                    </span>
                    <span>
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Priority Breakdown</h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Urgent',
                count: tasksByPriority.URGENT,
                bg: 'bg-red-50 text-red-700 border-red-200',
              },
              {
                label: 'High',
                count: tasksByPriority.HIGH,
                bg: 'bg-orange-50 text-orange-700 border-orange-200',
              },
              {
                label: 'Medium',
                count: tasksByPriority.MEDIUM,
                bg: 'bg-blue-50 text-blue-700 border-blue-200',
              },
              {
                label: 'Low',
                count: tasksByPriority.LOW,
                bg: 'bg-gray-100 text-gray-700 border-gray-200',
              },
            ].map((p) => (
              <div
                key={p.label}
                className={`rounded-lg border p-3.5 flex flex-col justify-between ${p.bg}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider">{p.label}</span>
                <span className="text-2xl font-black mt-2">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Workload Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Team Workload</h3>
          {unassignedCount > 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
              {unassignedCount} unassigned tasks
            </span>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {workload.map((member) => {
            const pct = totalTasks > 0 ? Math.round((member.count / totalTasks) * 100) : 0

            return (
              <div key={member.name} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                    {member.email && (
                      <p className="text-xs text-gray-400 truncate">{member.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-48">
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 shrink-0">
                    {member.count} ({pct}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
