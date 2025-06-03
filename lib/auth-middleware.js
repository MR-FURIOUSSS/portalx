import { AuthService } from "./auth-service.js"

export async function validateToken(request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "") || request.headers.get("Token")

  if (!token) {
    return { valid: false, error: "Authentication token required", status: 401 }
  }

  try {
    // Check if token is valid
    if (!AuthService.isTokenValid(token)) {
      return { valid: false, error: "Invalid or expired token", status: 401 }
    }

    // Get user by token
    const user = AuthService.getUserByToken(token)
    if (!user) {
      return { valid: false, error: "User not found", status: 401 }
    }

    return { valid: true, user, token }
  } catch (error) {
    console.error("Token validation error:", error)
    return { valid: false, error: "Authentication failed", status: 401 }
  }
}
