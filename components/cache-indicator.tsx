"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Database, Clock, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CacheIndicatorProps {
  token: string
  className?: string
}

export function CacheIndicator({ token, className }: CacheIndicatorProps) {
  const [cacheStatus, setCacheStatus] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchCacheStatus = async () => {
    setError("")
    try {
      const response = await fetch("/api/cache/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCacheStatus(data.cacheStatus)
        setLastUpdated(new Date())
      } else {
        setError("Failed to fetch cache status")
      }
    } catch (error) {
      console.error("Error fetching cache status:", error)
      setError("Network error")
    }
  }

  const clearAllCache = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/cache/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dataType: "all" }),
      })

      if (response.ok) {
        await fetchCacheStatus()
      } else {
        setError("Failed to clear cache")
      }
    } catch (error) {
      console.error("Error clearing cache:", error)
      setError("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCacheStatus()
    // Refresh cache status every 30 seconds
    const interval = setInterval(fetchCacheStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const cachedCount = Object.values(cacheStatus).filter(Boolean).length
  const totalCount = Object.keys(cacheStatus).length

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader className="pb-2 lg:pb-3">
        <CardTitle className="flex items-center justify-between text-sm lg:text-base">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Cache Status</span>
          </div>
          {error && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{error}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        <CardDescription className="text-xs">Data cached for faster loading (3 min expiry)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {cachedCount}/{totalCount} cached
            </span>
          </div>
          <Badge variant={cachedCount > 0 ? "default" : "secondary"} className="text-xs">
            {cachedCount > 0 ? "Active" : "Empty"}
          </Badge>
        </div>

        {/* Mobile: 2 columns, Desktop: 2 columns */}
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(cacheStatus).map(([dataType, isCached]) => (
            <div key={dataType} className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isCached ? "bg-green-400" : "bg-gray-400"}`} />
              <span className="capitalize text-muted-foreground truncate">{dataType}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllCache}
            disabled={isLoading || cachedCount === 0}
            className="w-full text-xs h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Clear Cache
          </Button>

          {lastUpdated && (
            <p className="text-xs text-center text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
