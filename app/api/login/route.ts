import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "../../../lib/auth-service.js"

export async function POST(request: NextRequest) {
  try {
    const { username, password, captcha, captchaDigest } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Normalize username
    const normalizedUsername = username.endsWith("@srmist.edu.in") ? username : username + "@srmist.edu.in"

    // Authenticate user
    const result = await AuthService.authenticateUser(normalizedUsername, password, captcha, captchaDigest)

    if (!result.success) {
      if (result.requiresCaptcha) {
        return NextResponse.json(
          {
            success: false,
            requiresCaptcha: true,
            captcha: result.captcha,
          },
          { status: 200 },
        )
      }
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: result.user,
      token: result.token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
