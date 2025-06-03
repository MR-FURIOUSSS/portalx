import { supabase } from "../lib/supabase.js"

export const authMiddleware = async (c, next) => {
  // Skip auth check for specific routes
  const openRoutes = ["/api/login", "/api/refresh-token", "/api/health"]

  if (openRoutes.includes(c.req.path)) {
    await next()
    return
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "") || c.req.header("Token")

  if (!token) {
    return c.json({ error: "Authentication token required" }, 401)
  }

  try {
    // Find user by token and check if it's valid
    const { data: user, error } = await supabase.from("users").select("*").eq("session_token", token).single()

    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401)
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(user.token_expires_at)

    if (now >= expiresAt) {
      return c.json(
        {
          error: "Token expired",
          message: "Please login again",
          expired: true,
        },
        401,
      )
    }

    // Add user info to context
    c.set("user", user)
    await next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return c.json({ error: "Authentication failed" }, 401)
  }
}
