"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, MapPin } from "lucide-react"

interface ClassSlot {
  slot: string
  isClass: boolean
  time: string
  courseTitle?: string
  courseCode?: string
  courseCategory?: string
  courseRoomNo?: string
}

interface DaySchedule {
  dayOrder: string
  class: ClassSlot[]
}

interface TimetableViewProps {
  token: string
}

export function TimetableView({ token }: TimetableViewProps) {
  const [timetable, setTimetable] = useState<DaySchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTimetable()
  }, [])

  const fetchTimetable = async () => {
    try {
      const response = await fetch("/api/timetable", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch timetable")
      }

      const data = await response.json()
      setTimetable(data.timetable || [])
    } catch (error) {
      setError("Failed to load timetable data")
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Clock className="h-5 w-5" />
            <span>Weekly Timetable</span>
          </CardTitle>
          <CardDescription className="text-foreground">Your class schedule for each day</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {timetable.map((day, dayIndex) => (
          <Card key={dayIndex} className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">{day.dayOrder}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {day.class.map((classSlot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={`p-4 rounded-lg border ${
                      classSlot.isClass ? "bg-primary/10 border-primary/20" : "bg-muted border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-foreground">{classSlot.time}</div>
                        <Badge variant="outline" className="text-xs">
                          {classSlot.slot}
                        </Badge>
                      </div>

                      {classSlot.isClass ? (
                        <div className="flex-1 ml-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-sm text-foreground">{classSlot.courseCode}</h4>
                              <p className="text-xs text-muted-foreground">{classSlot.courseTitle}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{classSlot.courseRoomNo}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {classSlot.courseCategory}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 ml-4 text-center">
                          <span className="text-sm text-muted-foreground">Free Period</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
