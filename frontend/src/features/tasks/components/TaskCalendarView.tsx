import { useMemo, useState } from 'react'

import type { Task } from '../types'

type TaskCalendarViewProps = {
  tasks: Task[]
  onSelectTask: (task: Task) => void
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function TaskCalendarView({ tasks, onSelectTask }: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // ── Month Math: Days count & First day offset ──
  const { daysInMonth, firstDayIndex } = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return { daysInMonth: totalDays, firstDayIndex: firstDay }
  }, [year, month])

  // ── Group tasks by Due Date (YYYY-MM-DD) for O(1) cell lookup ──
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of tasks) {
      if (!task.dueDate) continue
      const dateKey = task.dueDate.split('T')[0]
      const existing = map.get(dateKey) ?? []
      existing.push(task)
      map.set(dateKey, existing)
    }
    return map
  }, [tasks])

  const todayKey = new Date().toISOString().split('T')[0]

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-2xs overflow-hidden">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/50">
        <h3 className="text-base font-bold text-gray-900">
          {MONTH_NAMES[month]} {year}
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToday}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            title="Previous month"
            className="rounded-lg border border-gray-200 bg-white p-1 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            title="Next month"
            className="rounded-lg border border-gray-200 bg-white p-1 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 text-center text-[11px] font-semibold text-gray-500 py-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 min-h-[500px]">
        {/* Leading empty cells before the 1st of month */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50/30 p-2 min-h-[90px]" />
        ))}

        {/* Days of the Month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
          const isToday = dateStr === todayKey
          const dayTasks = tasksByDate.get(dateStr) ?? []

          return (
            <div
              key={dateStr}
              className={`p-1.5 min-h-[90px] flex flex-col transition hover:bg-indigo-50/20 ${
                isToday ? 'bg-indigo-50/40' : ''
              }`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                  }`}
                >
                  {dayNum}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </div>

              {/* Task Cards inside Date Cell */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-24">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    title={t.title}
                    className={`rounded px-1.5 py-0.5 text-[11px] font-medium truncate cursor-pointer transition border ${
                      t.status === 'DONE'
                        ? 'bg-green-50 text-green-700 border-green-200 line-through'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-indigo-400 hover:shadow-2xs'
                    }`}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
