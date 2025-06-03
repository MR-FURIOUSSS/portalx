"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock } from "lucide-react"

interface CalendarDay {
  date: string
  day: string
  event: string
  dayOrder: string
}

interface CalendarMonth {
  month: string
  days: CalendarDay[]
}

interface CalendarViewProps {
  token: string
}

export function CalendarView({ token }: CalendarViewProps) {
  const [calendar, setCalendar] = useState<CalendarMonth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCalendar()
  }, [])

  const fetchCalendar = async () => {
    try {
      const response = await fetch("/api/calendar", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch calendar")
      }

      const data = await response.json()
      setCalendar(data.calendar || [])
    } catch (error) {
      setError("Failed to load calendar data")
    } finally {
      setIsLoading(false)
    }
  }

  const getEventType = (event: string) => {
    const eventLower = event.toLowerCase()
    if (eventLower.includes("exam") || eventLower.includes("test")) {
      return { type: "exam", color: "bg-red-500/10 text-red-400 border-red-500/20" }
    }
    if (eventLower.includes("holiday") || eventLower.includes("break")) {
      return { type: "holiday", color: "bg-green-500/10 text-green-400 border-green-500/20" }
    }
    if (eventLower.includes("registration") || eventLower.includes("admission")) {
      return { type: "registration", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
    }
    return { type: "general", color: "bg-muted text-foreground border-border" }
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
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Academic Calendar</span>
          </CardTitle>
          <CardDescription>Important dates and events for the academic year</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {calendar.map((month, monthIndex) => (
          <Card key={monthIndex} className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">{month.month}</CardTitle>
              <CardDescription>{month.days.filter((day) => day.event).length} events this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {month.days
                  .filter((day) => day.event && day.event.trim() !== "")
                  .map((day, dayIndex) => {
                    const eventInfo = getEventType(day.event)

                    return (
                      <div
                        key={dayIndex}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center min-w-[60px]">
                            <div className="text-2xl font-bold text-primary">{day.date}</div>
                            <div className="text-xs text-muted-foreground uppercase">{day.day}</div>
                          </div>

                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{day.event}</h3>
                            {day.dayOrder && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{day.dayOrder}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Badge variant="outline" className={`${eventInfo.color} border`}>
                          {eventInfo.type}
                        </Badge>
                      </div>
                    )
                  })}

                {month.days.filter((day) => day.event && day.event.trim() !== "").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No events scheduled for this month</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
