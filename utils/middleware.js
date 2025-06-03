export const tokenMiddleware = async (c, next) => {
  // Skip token check for specific routes
  const openRoutes = [
    "/api/login/user",
    "/api/login/password",
    "/api/login/captcha",
  ];
  if (openRoutes.includes(c.req.path)) {
    await next();
    return;
  }
  const token = c.req.header("Token");
  if (!token) {
    return c.json({ error: "Token is required" }, 401);
  }
  await next();
};
