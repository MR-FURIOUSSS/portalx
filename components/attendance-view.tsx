"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react"
import { DataStatusIndicator } from "@/components/data-status-indicator"

interface AttendanceData {
  courseCode: string
  courseType: string
  courseTitle: string
  courseCategory: string
  courseFaculty: string
  courseSlot: string
  courseAttendance: string
}

interface AttendanceViewProps {
  token: string
}

export function AttendanceView({ token }: AttendanceViewProps) {
  const [attendance, setAttendance] = useState<AttendanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [fromCache, setFromCache] = useState(false)
  const [cacheInfo, setCacheInfo] = useState("")

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const response = await fetch("/api/attendance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch attendance")
      }

      const data = await response.json()
      setAttendance(data.attendance || [])
      setFromCache(data.fromCache || false)
      setCacheInfo(data.cacheInfo || "")
    } catch (error) {
      setError("Failed to load attendance data")
    } finally {
      setIsLoading(false)
    }
  }

  const getAttendancePercentage = (attendance: string) => {
    const match = attendance.match(/(\d+)%/)
    return match ? Number.parseInt(match[1]) : 0
  }

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 85) return { status: "excellent", color: "bg-green-500", icon: TrendingUp }
    if (percentage >= 75) return { status: "good", color: "bg-blue-500", icon: TrendingUp }
    if (percentage >= 65) return { status: "warning", color: "bg-yellow-500", icon: TrendingDown }
    return { status: "critical", color: "bg-red-500", icon: TrendingDown }
  }

  const averageAttendance =
    attendance.length > 0
      ? Math.round(
          attendance.reduce((sum, item) => sum + getAttendancePercentage(item.courseAttendance), 0) / attendance.length,
        )
      : 0

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Summary Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 lg:pb-6">
          <CardTitle className="flex items-center justify-between text-foreground text-lg lg:text-xl">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Attendance Overview</span>
            </div>
            <DataStatusIndicator fromCache={fromCache} cacheInfo={cacheInfo} />
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">Your overall attendance summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl lg:text-3xl font-bold text-primary text-foreground">{averageAttendance}%</div>
              <p className="text-sm text-muted-foreground">Overall Attendance</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl lg:text-3xl font-bold text-green-400 text-foreground">{attendance.length}</div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl lg:text-3xl font-bold text-purple-400 text-foreground">
                {attendance.filter((item) => getAttendancePercentage(item.courseAttendance) >= 75).length}
              </div>
              <p className="text-sm text-muted-foreground">Above 75%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Attendance */}
      <div className="grid gap-3 lg:gap-4">
        {attendance.map((item, index) => {
          const percentage = getAttendancePercentage(item.courseAttendance)
          const status = getAttendanceStatus(percentage)
          const StatusIcon = status.icon

          return (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-4 lg:p-6">
                <div className="space-y-4">
                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-base text-foreground truncate">{item.courseCode}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.courseType}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-1 line-clamp-2">{item.courseTitle}</p>
                      </div>
                      <div className="text-right ml-3">
                        <div className="flex items-center space-x-1 mb-1">
                          <StatusIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xl font-bold text-foreground">{percentage}%</span>
                        </div>
                        <Badge variant={percentage >= 75 ? "default" : "destructive"} className="text-xs">
                          {percentage >= 85
                            ? "Excellent"
                            : percentage >= 75
                              ? "Good"
                              : percentage >= 65
                                ? "Warning"
                                : "Critical"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Faculty:</span>
                        <span className="text-foreground truncate ml-2">{item.courseFaculty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slot:</span>
                        <span className="text-foreground">{item.courseSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.courseCategory}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:block">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">{item.courseCode}</h3>
                          <Badge variant="outline">{item.courseType}</Badge>
                          <Badge variant="secondary">{item.courseCategory}</Badge>
                        </div>
                        <p className="text-foreground mb-1">{item.courseTitle}</p>
                        <p className="text-sm text-muted-foreground">Faculty: {item.courseFaculty}</p>
                        <p className="text-sm text-muted-foreground">Slot: {item.courseSlot}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <StatusIcon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-2xl font-bold text-foreground">{percentage}%</span>
                        </div>
                        <Badge variant={percentage >= 75 ? "default" : "destructive"} className="text-xs">
                          {percentage >= 85
                            ? "Excellent"
                            : percentage >= 75
                              ? "Good"
                              : percentage >= 65
                                ? "Warning"
                                : "Critical"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">Attendance Progress</span>
                      <span className="text-foreground">{item.courseAttendance}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
