import { SocketIOProvider } from 'y-socket.io'

const SOCKET_ROOM = 'monaco'
const SOCKET_IO_OPTIONS = {
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  withCredentials: true,
  forceNew: true,
}

export function getSocketUrl() {
  const socketUrl = import.meta.env.VITE_SOCKET_URL?.trim()

  if (!socketUrl) {
    console.error(
      '[ZeesCode] Missing VITE_SOCKET_URL. Set it to your Render backend URL before starting the frontend.'
    )
    return ''
  }

  return socketUrl.replace(/\/$/, '')
}

export function createRealtimeProvider(ydoc, { username = '' } = {}) {
  const socketUrl = getSocketUrl()

  if (!socketUrl) {
    return null
  }

  const provider = new SocketIOProvider(
    socketUrl,
    SOCKET_ROOM,
    ydoc,
    {
      autoConnect: true,
      disableBc: true,
    },
    SOCKET_IO_OPTIONS
  )

  provider.on('status', (statusPayload) => {
    const [payload] = statusPayload || []

    if (payload?.status === 'connecting') {
      console.log('[ZeesCode] Realtime connection is reconnecting…')
    }

    if (payload?.status === 'connected') {
      console.log('[ZeesCode] Realtime connection established.')
    }

    if (payload?.status === 'disconnected') {
      console.log('[ZeesCode] Realtime connection disconnected.')
    }
  })

  provider.on('synced', ([synced]) => {
    if (synced) {
      console.log('[ZeesCode] Realtime synchronization completed.')
    }
  })

  provider.socket.on('connect', () => {
    console.log('[ZeesCode] Client connected to collaborative room:', SOCKET_ROOM)
    provider.awareness.setLocalStateField('user', { username })
  })

  provider.socket.on('disconnect', (reason) => {
    console.warn('[ZeesCode] Client disconnected from collaborative room:', reason)
  })

  provider.socket.on('connect_error', (error) => {
    console.error('[ZeesCode] Socket connection error:', error)
  })

  provider.socket.on('reconnect_attempt', (attempt) => {
    console.log('[ZeesCode] Attempting realtime reconnect:', attempt)
  })

  provider.socket.on('reconnect_failed', () => {
    console.error('[ZeesCode] Realtime reconnect failed. The Render backend may be unavailable.')
  })

  provider.socket.on('error', (error) => {
    console.error('[ZeesCode] Socket transport error:', error)
  })

  return provider
}
