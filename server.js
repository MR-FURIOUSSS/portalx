import { Hono } from "hono"
import { cors } from "hono/cors"
import { attendanceHandler } from "./handler/attendance.js"
import { marksHandler } from "./handler/marks.js"
import { courseHandler } from "./handler/course.js"
import { calendarHandler } from "./handler/calendar.js"
import { timetableHandler } from "./handler/timetable.js"
import { userInfoHandler } from "./handler/userInfo.js"
import { authMiddleware } from "./utils/auth-middleware.js"
import { loginHandler } from "./handler/Auth/login.js"
import { refreshTokenHandler } from "./handler/Auth/refresh-token.js"
import { logoutHandler } from "./handler/Auth/logout.js"

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
app.post("/api/login", loginHandler)
app.post("/api/refresh-token", refreshTokenHandler)
app.post("/api/logout", logoutHandler)

// Apply auth middleware to protected routes
app.use("/api/*", authMiddleware)

// Protected routes
app.get("/api/attendance", attendanceHandler)
app.get("/api/userinfo", userInfoHandler)
app.get("/api/marks", marksHandler)
app.get("/api/course", courseHandler)
app.get("/api/calendar", calendarHandler)
app.get("/api/timetable", timetableHandler)

export default app
