/**
 * Real-time WebSocket client using Socket.IO.
 * Gracefully degrades when server doesn't support WebSocket (e.g. Windows dev).
 * Notification polling in useNotifications.ts handles updates when WS is unavailable.
 */
import { io, Socket } from 'socket.io-client'
import { getAccessToken } from '@/lib/api'
import type { Notification } from '@/types'

let socket: Socket | null = null
let listeners: Map<string, Set<(data: any) => void>> = new Map()
let connectionFailed = false

export function connectSocket() {
  // Don't retry if we already know the server doesn't support WS
  if (connectionFailed || socket?.connected) return

  const token = getAccessToken()
  if (!token) return

  const url = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || ''
  if (!url) return

  try {
    socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 2, // Only try twice, then give up
      reconnectionDelay: 5000,
      timeout: 5000,
    })

    socket.on('connect', () => {
      connectionFailed = false
    })

    // Silently handle connection failures
    socket.on('connect_error', () => {
      connectionFailed = true
      socket?.disconnect()
      socket = null
    })

    socket.on('notification', (data: Notification) => {
      const cbs = listeners.get('notification')
      if (cbs) cbs.forEach(cb => cb(data))
    })

    socket.on('bid_update', (data: any) => {
      const cbs = listeners.get('bid_update')
      if (cbs) cbs.forEach(cb => cb(data))
    })
  } catch {
    connectionFailed = true
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function onEvent(event: string, callback: (data: any) => void) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set())
  }
  listeners.get(event)!.add(callback)

  return () => {
    listeners.get(event)?.delete(callback)
  }
}

export function markReadViaSocket(notificationId: number) {
  if (socket?.connected) {
    socket.emit('mark_read', { notification_id: notificationId })
  }
}
