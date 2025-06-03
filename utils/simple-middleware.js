export const simpleTokenMiddleware = async (c, next) => {
  // Skip token check for specific routes
  const openRoutes = ["/api/login", "/api/refresh-token", "/api/health"]

  if (openRoutes.includes(c.req.path)) {
    await next()
    return
  }

  const token = c.req.header("Authorization")?.replace("Bearer ", "") || c.req.header("Token")

  if (!token) {
    return c.json({ error: "Authentication token required" }, 401)
  }

  // For now, just pass the token through - we'll validate it in each handler
  c.set("token", token)
  await next()
}
