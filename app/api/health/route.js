import { NextResponse } from "next/server"
import { CacheService } from "../../../lib/cache-service.js"
import { AuthService } from "../../../lib/auth-service.js"

export async function GET() {
  try {
    // Run cache cleanup
    CacheService.cleanupExpiredCache()

    // Clear expired sessions
    AuthService.clearExpiredSessions()

    // Get stats
    const cacheStats = CacheService.getGlobalStats()
    const sessionStats = AuthService.getSessionStats()

    return NextResponse.json({
      status: "ok",
      message: "SRM Academia API is running",
      cache: {
        enabled: true,
        entries: cacheStats.size,
        timers: cacheStats.timers,
      },
      sessions: {
        active: sessionStats.activeSessions,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
