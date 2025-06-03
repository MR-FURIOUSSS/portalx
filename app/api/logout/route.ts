import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "../../../lib/auth-service.js"
import { CacheService } from "../../../lib/cache-service.js"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "") || request.headers.get("Token")

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 })
    }

    // Clear session and cache
    AuthService.clearSession(token)
    CacheService.clearAllCache(token)

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
