import app from "./server-simple.js"
import { serve } from "@hono/node-server"

const port = process.env.PORT || 3001

serve({
  fetch: app.fetch,
  port: port,
})

console.log(`🚀 Server running on http://localhost:${port}`)
