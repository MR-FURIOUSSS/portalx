import { verifyUser, verifyPassword } from "../fetch/login.js"
import { withCaptcha } from "../fetch/withcaptcha.js"
import { getCaptcha } from "../utils/getCaptcha.js"
import { fetchUserInfo } from "../fetch/user.js"
import { parseUserInfo } from "../parser/user.js"

// Simple in-memory session storage
const sessions = new Map()

export class AuthService {
  // Check if token is valid
  static isTokenValid(token) {
    const session = sessions.get(token)
    if (!session) return false

    const now = Date.now()
    if (now > session.expiresAt) {
      sessions.delete(token)
      return false
    }

    return true
  }

  // Get user by session token
  static getUserByToken(token) {
    if (!this.isTokenValid(token)) {
      return null
    }

    const session = sessions.get(token)
    return session ? session.user : null
  }

  // Generate a simple session token
  static generateSessionToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Save session
  static saveSession(sessionToken, userInfo) {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    sessions.set(sessionToken, {
      user: userInfo,
      expiresAt,
      createdAt: Date.now(),
    })

    console.log(`Session created for ${userInfo.name} (expires in 24 hours)`)
  }

  // Complete authentication flow
  static async authenticateUser(username, password, captcha = null, captchaDigest = null) {
    try {
      // Step 1: Verify user
      const userVerification = await verifyUser(username)
      if (userVerification.error) {
        return { success: false, error: userVerification.error }
      }

      // Step 2: Verify password
      const authResult = await verifyPassword(userVerification.digest, userVerification.identity, password)

      if (authResult.error) {
        return { success: false, error: authResult.error }
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
            return { success: false, error: captchaData.error }
          }

          return {
            success: false,
            requiresCaptcha: true,
            captcha: {
              digest: authResult.captcha.digest,
              image: captchaData.image_bytes,
            },
          }
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
            return { success: false, error: captchaResult.error }
          }

          sessionToken = captchaResult
        }
      } else {
        return { success: false, error: authResult.message || "Authentication failed" }
      }

      if (!sessionToken) {
        return { success: false, error: "Failed to obtain session token" }
      }

      // Step 4: Fetch user info
      const userInfoData = await fetchUserInfo(sessionToken)
      if (userInfoData.error) {
        return { success: false, error: userInfoData.error }
      }

      const parsedUserInfo = await parseUserInfo(userInfoData)
      if (parsedUserInfo.error) {
        return { success: false, error: parsedUserInfo.error }
      }

      // Step 5: Save session
      this.saveSession(sessionToken, parsedUserInfo.userInfo)

      return {
        success: true,
        user: parsedUserInfo.userInfo,
        token: sessionToken,
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Clear session
  static clearSession(token) {
    const deleted = sessions.delete(token)
    if (deleted) {
      console.log(`Session cleared for token: ${token.substring(0, 10)}...`)
    }
    return deleted
  }

  // Clear expired sessions (cleanup job)
  static clearExpiredSessions() {
    const now = Date.now()
    let cleared = 0

    for (const [token, session] of sessions.entries()) {
      if (now > session.expiresAt) {
        sessions.delete(token)
        cleared++
      }
    }

    if (cleared > 0) {
      console.log(`Cleared ${cleared} expired sessions`)
    }

    return cleared
  }

  // Get session stats
  static getSessionStats() {
    return {
      activeSessions: sessions.size,
      sessions: Array.from(sessions.entries()).map(([token, session]) => ({
        token: token.substring(0, 10) + "...",
        user: session.user.name,
        expiresAt: new Date(session.expiresAt).toISOString(),
        createdAt: new Date(session.createdAt).toISOString(),
      })),
    }
  }
}

// Clean up expired sessions every hour
setInterval(
  () => {
    AuthService.clearExpiredSessions()
  },
  60 * 60 * 1000,
)
