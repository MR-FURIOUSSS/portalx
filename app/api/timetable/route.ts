import { type NextRequest, NextResponse } from "next/server"
import { fetchCourseDetails } from "../../../fetch/course.js"
import { parseTimetable } from "../../../parser/timetable.js"
import { CacheService } from "../../../lib/cache-service.js"
import { validateToken } from "../../../lib/auth-middleware.js"

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateToken(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { token } = authResult

    // Check cache first
    const cachedData = CacheService.getCachedData(token, "timetable")
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        cacheInfo: "Data served from cache (updated within last 3 minutes)",
      })
    }

    // Cache miss - fetch fresh data
    console.log("Cache MISS for timetable - fetching fresh data")
    const fetch = await fetchCourseDetails(token)
    if (fetch.error) {
      return NextResponse.json({ error: fetch.error }, { status: fetch.status || 500 })
    }

    const parse = await parseTimetable(fetch)
    if (parse.error) {
      return NextResponse.json({ error: parse.error }, { status: parse.status || 500 })
    }

    // Cache the fresh data
    CacheService.setCachedData(token, "timetable", parse)

    return NextResponse.json({
      ...parse,
      fromCache: false,
      cacheInfo: "Fresh data fetched and cached",
    })
  } catch (error) {
    console.error("Timetable error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
