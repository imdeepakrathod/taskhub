import app from './app.js'

const PORT = Number(process.env.PORT) || 4000

const server = app.listen(PORT, () => {
  console.warn(`Server running on http://localhost:${PORT}`)
})

const shutdown = (signal: string) => {
  console.warn(`${signal} received, shutting down`)
  server.close(() => process.exit(0))
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
