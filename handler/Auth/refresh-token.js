import { AuthService } from "../../lib/auth-service.js"

export async function refreshTokenHandler(c) {
  try {
    const { username } = await c.req.json()

    if (!username) {
      return c.json({ error: "Username is required" }, 400)
    }

    const normalizedUsername = username.endsWith("@srmist.edu.in") ? username : username + "@srmist.edu.in"

    const validToken = await AuthService.getValidToken(normalizedUsername)

    if (validToken) {
      const user = await AuthService.getUserByUsername(normalizedUsername)
      return c.json({
        success: true,
        valid: true,
        user: {
          name: user.name,
          regNumber: user.reg_number,
          mobile: user.mobile,
          department: user.department,
          program: user.program,
          section: user.section,
          semester: user.semester,
          batch: user.batch,
        },
        token: validToken,
      })
    } else {
      return c.json({
        success: true,
        valid: false,
        message: "Token expired or invalid. Please login again.",
      })
    }
  } catch (error) {
    console.error("Token refresh error:", error)
    return c.json({ error: "Internal server error" }, 500)
  }
}
