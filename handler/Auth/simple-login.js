import { verifyUser, verifyPassword } from "../../fetch/login.js"
import { withCaptcha } from "../../fetch/withcaptcha.js"
import { getCaptcha } from "../../utils/getCaptcha.js"
import { fetchUserInfo } from "../../fetch/user.js"
import { parseUserInfo } from "../../parser/user.js"

export async function simpleLoginHandler(c) {
  try {
    const { username, password, captcha, captchaDigest } = await c.req.json()

    if (!username || !password) {
      return c.json({ error: "Username and password are required" }, 400)
    }

    // Normalize username
    const normalizedUsername = username.endsWith("@srmist.edu.in") ? username : username + "@srmist.edu.in"

    // Step 1: Verify user
    const userVerification = await verifyUser(normalizedUsername)
    if (userVerification.error) {
      return c.json({ success: false, error: userVerification.error }, 400)
    }

    // Step 2: Verify password
    const authResult = await verifyPassword(userVerification.digest, userVerification.identity, password)

    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, 400)
    }

    let sessionToken = null

    // Step 3: Handle authentication result
    if (authResult.isAuthenticated) {
      sessionToken = authResult.cookies
    } else if (authResult.captcha?.required) {
      if (!captcha || !captchaDigest) {
        // Return CAPTCHA requirement
        const captchaData = await getCaptcha(authResult.captcha.digest)
        if (captchaData.error) {
          return c.json({ success: false, error: captchaData.error }, 500)
        }

        return c.json({
          success: false,
          requiresCaptcha: true,
          captcha: {
            digest: authResult.captcha.digest,
            image: captchaData.image_bytes,
          },
        })
      } else {
        // Solve CAPTCHA
        const captchaResult = await withCaptcha(
          userVerification.identity,
          userVerification.digest,
          captcha,
          captchaDigest,
          password,
        )

        if (captchaResult.error) {
          return c.json({ success: false, error: captchaResult.error }, 400)
        }

        sessionToken = captchaResult
      }
    } else {
      return c.json(
        {
          success: false,
          error: authResult.message || "Authentication failed",
        },
        401,
      )
    }

    if (!sessionToken) {
      return c.json({ success: false, error: "Failed to obtain session token" }, 500)
    }

    // Step 4: Fetch user info
    const userInfoData = await fetchUserInfo(sessionToken)
    if (userInfoData.error) {
      return c.json({ success: false, error: userInfoData.error }, 500)
    }

    const parsedUserInfo = await parseUserInfo(userInfoData)
    if (parsedUserInfo.error) {
      return c.json({ success: false, error: parsedUserInfo.error }, 500)
    }

    return c.json({
      success: true,
      message: "Authentication successful",
      user: parsedUserInfo.userInfo,
      token: sessionToken,
    })
  } catch (error) {
    console.error("Login error:", error)
    return c.json({ error: "Internal server error" }, 500)
  }
}
