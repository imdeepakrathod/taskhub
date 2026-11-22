import { useEffect, useRef, useState } from 'react'

import type { Task } from '../types'
import { exportTasksToCSV, exportTasksToJSON } from '../utils/exportTasks'

type ExportTasksMenuProps = {
  tasks: Task[]
  allTasks: Task[]
  projectName: string
}

export function ExportTasksMenu({ tasks, allTasks, projectName }: ExportTasksMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered')
  const menuRef = useRef<HTMLDivElement>(null)

  const hasFilterActive = tasks.length !== allTasks.length

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const targetTasks = hasFilterActive && exportScope === 'filtered' ? tasks : allTasks

  const handleExportCSV = () => {
    exportTasksToCSV(targetTasks, projectName)
    setIsOpen(false)
  }

  const handleExportJSON = () => {
    exportTasksToJSON(targetTasks, projectName)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-2xs transition cursor-pointer"
        title="Export tasks to CSV or JSON"
      >
        <span>📥</span>
        <span>Export</span>
        <span className="text-[10px] text-gray-400">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-64 z-30 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 border-b border-gray-100 dark:border-gray-700/60 mb-2">
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">Export Tasks</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Download tasks data for analysis or backup
            </p>
          </div>

          {/* Scope Selector if filters are active */}
          {hasFilterActive && (
            <div className="mb-2 px-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
                Data Scope
              </label>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setExportScope('filtered')}
                  className={`rounded py-1 font-semibold transition cursor-pointer ${
                    exportScope === 'filtered'
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Filtered ({tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('all')}
                  className={`rounded py-1 font-semibold transition cursor-pointer ${
                    exportScope === 'all'
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  All ({allTasks.length})
                </button>
              </div>
            </div>
          )}

          {/* Export Actions */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={targetTasks.length === 0}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📄</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    Export as CSV
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500">
                    For Excel & Google Sheets
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400">.csv</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              disabled={targetTasks.length === 0}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📦</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    Export as JSON
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500">
                    Full raw data / backup
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-400">.json</span>
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 px-2 text-[10px] text-gray-400 text-center">
            {targetTasks.length} task{targetTasks.length === 1 ? '' : 's'} will be exported
          </div>
        </div>
      )}
    </div>
  )
}
