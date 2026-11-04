import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../constants/queryKeys'
import { getSocket } from '../../../lib/socket'
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../api/notificationsApi'
import type { Notification, NotificationsResponse } from '../types'

export function useNotifications(workspaceId: string) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.byWorkspace(workspaceId),
    queryFn: () => fetchNotifications(workspaceId),
    enabled: Boolean(workspaceId),
  })

  // ── Listen for real-time notifications via Socket.IO ──
  useEffect(() => {
    if (!workspaceId) return

    const socket = getSocket()
    if (!socket.connected) {
      socket.connect()
    }

    const onNotificationReceived = (newNotif: Notification) => {
      // Only process notifications for the active workspace
      if (newNotif.workspaceId !== workspaceId) return

      queryClient.setQueryData<NotificationsResponse>(
        queryKeys.notifications.byWorkspace(workspaceId),
        (old) => {
          if (!old) {
            return { notifications: [newNotif], unreadCount: 1 }
          }
          if (old.notifications.some((n) => n.id === newNotif.id)) {
            return old
          }
          return {
            notifications: [newNotif, ...old.notifications],
            unreadCount: old.unreadCount + 1,
          }
        },
      )
    }

    socket.on('notification:received', onNotificationReceived)

    return () => {
      socket.off('notification:received', onNotificationReceived)
    }
  }, [workspaceId, queryClient])

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(workspaceId, notificationId),
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData<NotificationsResponse>(
        queryKeys.notifications.byWorkspace(workspaceId),
        (old) => {
          if (!old) return old
          const target = old.notifications.find((n) => n.id === notificationId)
          if (!target || target.read) return old

          return {
            notifications: old.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n,
            ),
            unreadCount: Math.max(0, old.unreadCount - 1),
          }
        },
      )
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(workspaceId),
    onSuccess: () => {
      queryClient.setQueryData<NotificationsResponse>(
        queryKeys.notifications.byWorkspace(workspaceId),
        (old) => {
          if (!old) return old
          return {
            notifications: old.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }
        },
      )
    },
  })

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
  }
}
