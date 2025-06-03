"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Database, Zap, Clock } from "lucide-react"

interface DataStatusIndicatorProps {
  fromCache?: boolean
  cacheInfo?: string
  className?: string
}

export function DataStatusIndicator({ fromCache, cacheInfo, className }: DataStatusIndicatorProps) {
  if (!fromCache && !cacheInfo) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={fromCache ? "default" : "secondary"}
            className={`text-xs flex items-center space-x-1 ${className}`}
          >
            {fromCache ? (
              <>
                <Zap className="h-3 w-3" />
                <span>Cached</span>
              </>
            ) : (
              <>
                <Database className="h-3 w-3" />
                <span>Fresh</span>
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{cacheInfo || "Data fetched from server"}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
