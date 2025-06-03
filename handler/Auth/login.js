import { AuthService } from "../../lib/auth-service.js"

export async function loginHandler(c) {
  try {
    const { username, password, captcha, captchaDigest } = await c.req.json()

    if (!username || !password) {
      return c.json({ error: "Username and password are required" }, 400)
    }

    // Normalize username
    const normalizedUsername = username.endsWith("@srmist.edu.in") ? username : username + "@srmist.edu.in"

    // Check if user already has valid token
    const existingToken = await AuthService.getValidToken(normalizedUsername)
    if (existingToken) {
      const user = await AuthService.getUserByUsername(normalizedUsername)
      return c.json({
        success: true,
        message: "Already authenticated",
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
        token: existingToken,
      })
    }

    // Authenticate user
    const result = await AuthService.authenticateUser(normalizedUsername, password, captcha, captchaDigest)

    if (!result.success) {
      if (result.requiresCaptcha) {
        return c.json(
          {
            success: false,
            requiresCaptcha: true,
            captcha: result.captcha,
          },
          200,
        )
      }
      return c.json({ success: false, error: result.error }, 401)
    }

    return c.json({
      success: true,
      message: "Authentication successful",
      user: result.user,
      token: result.token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return c.json({ error: "Internal server error" }, 500)
  }
}
