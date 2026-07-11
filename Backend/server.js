import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { YSocketIO } from 'y-socket.io/dist/server'

const app = express()
const httpServer = createServer(app)

const configuredOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i
const allowedOrigins = Array.from(
  new Set([
    ...configuredOrigins,
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
  ])
)

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || localhostOriginPattern.test(origin)) {
        callback(null, true)
        return
      }

      console.error(`[Socket] Blocked origin: ${origin}`)
      callback(new Error('Origin not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 20000,
  pingInterval: 25000,
})

app.use(express.json())
app.use(express.static('public'))

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

app.use((error, _req, res, _next) => {
  console.error('[Server] Unhandled error:', error)
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  })
})

const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()

ySocketIO.on('document-loaded', (doc) => {
  console.log(`[Yjs] Synchronization started for room: ${doc.name}`)
})

ySocketIO.on('document-update', (doc) => {
  console.log(`[Yjs] Synchronization completed for room: ${doc.name}`)
})

ySocketIO.on('awareness-update', (doc) => {
  console.log(`[Yjs] Awareness update received for room: ${doc.name}`)
})

io.of(/^\/yjs\|.*$/).on('connection', (socket) => {
  const roomName = socket.nsp.name.split('|')[1] || 'unknown'

  console.log(`[Socket] Client connected: ${socket.id} -> room: ${roomName}`)

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id} -> reason: ${reason}`)
  })

  socket.on('error', (error) => {
    console.error(`[Socket] Socket error for ${socket.id}:`, error)
  })
})

io.engine.on('connection_error', (error) => {
  console.error('[Socket] Engine connection error:', error?.message || error)
})

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  console.log(`[Server] Backend listening on http://localhost:${PORT}`)
  console.log(`[Server] Allowed frontend origins: ${allowedOrigins.join(', ')}`)
})

process.on('SIGTERM', () => {
  console.log('[Server] Shutdown signal received. Closing server...')
  httpServer.close(() => process.exit(0))
})