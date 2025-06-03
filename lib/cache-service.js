// Simple in-memory cache with expiration
class SimpleCache {
  constructor() {
    this.cache = new Map()
    this.timers = new Map()

    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  set(key, value, ttlMinutes = 3) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
    }

    // Store the value with timestamp
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    })

    // Set expiration timer
    const timer = setTimeout(
      () => {
        this.delete(key)
      },
      ttlMinutes * 60 * 1000,
    )

    this.timers.set(key, timer)

    console.log(`Cache SET: ${key} (expires in ${ttlMinutes} minutes)`)
  }

  get(key) {
    const item = this.cache.get(key)

    if (!item) {
      console.log(`Cache MISS: ${key}`)
      return null
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      console.log(`Cache EXPIRED: ${key}`)
      this.delete(key)
      return null
    }

    console.log(`Cache HIT: ${key}`)
    return item.value
  }

  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
      this.timers.delete(key)
    }

    // Remove from cache
    const deleted = this.cache.delete(key)
    if (deleted) {
      console.log(`Cache DELETED: ${key}`)
    }
    return deleted
  }

  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()

    // Clear cache
    const size = this.cache.size
    this.cache.clear()
    console.log(`Cache CLEARED: ${size} items removed`)
  }

  cleanup() {
    const now = Date.now()
    let cleaned = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`Cache CLEANUP: ${cleaned} expired items removed`)
    }
  }

  getStatus() {
    const status = {}
    const dataTypes = ["attendance", "marks", "courses", "timetable", "calendar", "userinfo"]

    for (const dataType of dataTypes) {
      const hasData = Array.from(this.cache.keys()).some((key) => key.includes(dataType))
      status[dataType] = hasData
    }

    return status
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timers: this.timers.size,
    }
  }
}

// Create global cache instance
const globalCache = new SimpleCache()

export class CacheService {
  static CACHE_DURATION = 3 // minutes

  // Generate cache key
  static getCacheKey(token, dataType) {
    // Use first 10 characters of token as identifier
    const tokenId = token.substring(0, 10)
    return `${tokenId}:${dataType}`
  }

  // Get cached data
  static getCachedData(token, dataType) {
    const key = this.getCacheKey(token, dataType)
    return globalCache.get(key)
  }

  // Set cached data
  static setCachedData(token, dataType, data) {
    const key = this.getCacheKey(token, dataType)
    globalCache.set(key, data, this.CACHE_DURATION)
  }

  // Clear specific cache
  static clearCache(token, dataType) {
    const key = this.getCacheKey(token, dataType)
    return globalCache.delete(key)
  }

  // Clear all cache for a token
  static clearAllCache(token) {
    const tokenId = token.substring(0, 10)
    const keys = Array.from(globalCache.cache.keys()).filter((key) => key.startsWith(tokenId))

    let cleared = 0
    for (const key of keys) {
      if (globalCache.delete(key)) {
        cleared++
      }
    }

    console.log(`Cleared ${cleared} cache entries for token ${tokenId}`)
    return cleared
  }

  // Get cache status for a token
  static getCacheStatus(token) {
    const tokenId = token.substring(0, 10)
    const status = {
      attendance: false,
      marks: false,
      courses: false,
      timetable: false,
      calendar: false,
      userinfo: false,
    }

    for (const [key, item] of globalCache.cache.entries()) {
      if (key.startsWith(tokenId) && Date.now() <= item.expiresAt) {
        const dataType = key.split(":")[1]
        if (status.hasOwnProperty(dataType)) {
          status[dataType] = true
        }
      }
    }

    return status
  }

  // Clean up expired cache
  static cleanupExpiredCache() {
    globalCache.cleanup()
  }

  // Get global cache stats
  static getGlobalStats() {
    return globalCache.getStats()
  }
}
