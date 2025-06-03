import { Hono } from "hono"
import { cors } from "hono/cors"
import { attendanceHandler } from "./handler/attendance.js"
import { marksHandler } from "./handler/marks.js"
import { courseHandler } from "./handler/course.js"
import { calendarHandler } from "./handler/calendar.js"
import { timetableHandler } from "./handler/timetable.js"
import { userInfoHandler } from "./handler/userInfo.js"
import { simpleTokenMiddleware } from "./utils/simple-middleware.js"
import { simpleLoginHandler } from "./handler/Auth/simple-login.js"

const app = new Hono()

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization", "Token"],
    allowCredentials: true,
  }),
)

// Health check endpoint
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))

// Auth routes (no middleware)
app.post("/api/login", simpleLoginHandler)

// Simple refresh token endpoint
app.post("/api/refresh-token", (c) => {
  return c.json({
    success: true,
    valid: false,
    message: "Please login again",
  })
})

// Simple logout endpoint
app.post("/api/logout", (c) => {
  return c.json({
    success: true,
    message: "Logged out successfully",
  })
})

// Apply simple middleware to protected routes
app.use("/api/*", simpleTokenMiddleware)

// Protected routes - these will use the token from headers
app.get("/api/attendance", attendanceHandler)
app.get("/api/userinfo", userInfoHandler)
app.get("/api/marks", marksHandler)
app.get("/api/course", courseHandler)
app.get("/api/calendar", calendarHandler)
app.get("/api/timetable", timetableHandler)

export default app
