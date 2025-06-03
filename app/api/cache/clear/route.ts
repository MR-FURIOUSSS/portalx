import { type NextRequest, NextResponse } from "next/server"
import { CacheService } from "../../../../lib/cache-service.js"
import { validateToken } from "../../../../lib/auth-middleware.js"

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { token } = authResult
    const { dataType } = await request.json()

    if (dataType && dataType !== "all") {
      // Clear specific cache
      CacheService.clearCache(token, dataType)
      return NextResponse.json({
        success: true,
        message: `Cache cleared for ${dataType}`,
        timestamp: new Date().toISOString(),
      })
    } else {
      // Clear all cache
      const cleared = CacheService.clearAllCache(token)
      return NextResponse.json({
        success: true,
        message: `All cache cleared (${cleared} items)`,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Cache clear error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
