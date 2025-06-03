import { type NextRequest, NextResponse } from "next/server"
import { CacheService } from "../../../../lib/cache-service.js"
import { validateToken } from "../../../../lib/auth-middleware.js"

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { token } = authResult

    // Get cache status
    const cacheStatus = CacheService.getCacheStatus(token)

    return NextResponse.json({
      success: true,
      cacheStatus,
      cacheDuration: "3 minutes",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cache status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
