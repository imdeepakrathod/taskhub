import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { getSocket } from '../../../lib/socket'
import type { Task } from '../types'

export function useProjectSocket(projectId: string, workspaceId: string) {
  const queryClient = useQueryClient()
  // Initial state directly socket se check ho rahi hai!
  const [isConnected, setIsConnected] = useState(() => getSocket().connected)

  useEffect(() => {
    if (!projectId) return

    const socket = getSocket()

    if (!socket.connected) {
      socket.connect()
    }

    // Join this specific project room
    socket.emit('project:join', projectId)

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    // ── Real-Time Event Handlers ─────────────────────────

    const onTaskCreated = (newTask: Task) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks.byProject(projectId), (oldTasks = []) => {
        if (oldTasks.some((t) => t.id === newTask.id)) return oldTasks

        return [newTask, ...oldTasks]
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.analytics(workspaceId, projectId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.activity.byProject(projectId),
      })
    }

    const onTaskUpdated = (updatedTask: Task) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks.byProject(projectId), (oldTasks = []) =>
        oldTasks.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)),
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.analytics(workspaceId, projectId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.activity.byProject(projectId),
      })
    }

    const onTaskDeleted = ({ taskId }: { taskId: string }) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks.byProject(projectId), (oldTasks = []) =>
        oldTasks.filter((t) => t.id !== taskId),
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.analytics(workspaceId, projectId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.activity.byProject(projectId),
      })
    }
    const onAttachmentCreated = ({ taskId }: { taskId: string }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.byTask(taskId),
      })
    }

    const onAttachmentDeleted = ({ taskId }: { taskId: string }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.byTask(taskId),
      })
    }

    socket.on('task:attachment:created', onAttachmentCreated)
    socket.on('task:attachment:deleted', onAttachmentDeleted)
    socket.on('task:created', onTaskCreated)
    socket.on('task:updated', onTaskUpdated)
    socket.on('task:deleted', onTaskDeleted)

    return () => {
      socket.emit('project:leave', projectId)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('task:created', onTaskCreated)
      socket.off('task:updated', onTaskUpdated)
      socket.off('task:deleted', onTaskDeleted)
      socket.off('task:attachment:created', onAttachmentCreated)
      socket.off('task:attachment:deleted', onAttachmentDeleted)
    }
  }, [projectId, workspaceId, queryClient])

  return { isConnected }
}
