import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'

const app = express()

app.use(helmet())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(compression())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

console.log("Hello")
export default app
