"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, User, Clock, MapPin } from "lucide-react"

interface Course {
  courseCode: string
  courseTitle: string
  courseCredit: string
  courseCategory: string
  courseType: string
  courseFaculty: string
  courseSlot: string[]
  courseRoomNo: string
}

interface CourseViewProps {
  token: string
}

export function CourseView({ token }: CourseViewProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [batch, setBatch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/course", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }

      const data = await response.json()
      setCourses(data.courseList || [])
      setBatch(data.batch || "")
    } catch (error) {
      setError("Failed to load course data")
    } finally {
      setIsLoading(false)
    }
  }

  const totalCredits = courses.reduce((sum, course) => {
    return sum + (Number.parseFloat(course.courseCredit) || 0)
  }, 0)

  const coursesByCategory = courses.reduce(
    (acc, course) => {
      const category = course.courseCategory || "Other"
      if (!acc[category]) acc[category] = []
      acc[category].push(course)
      return acc
    },
    {} as Record<string, Course[]>,
  )

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
      {/* Summary Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <BookOpen className="h-5 w-5" />
            <span>Course Registration</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">Your enrolled courses for this semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary text-foreground">{courses.length}</div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 text-foreground">{totalCredits}</div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 text-foreground">{batch}</div>
              <p className="text-sm text-muted-foreground">Batch</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses by Category */}
      {Object.entries(coursesByCategory).map(([category, categoryCourses]) => (
        <Card key={category} className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{category}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {categoryCourses.length} course{categoryCourses.length !== 1 ? "s" : ""} •{" "}
              {categoryCourses.reduce((sum, course) => sum + (Number.parseFloat(course.courseCredit) || 0), 0)} credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {categoryCourses.map((course, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg text-foreground">{course.courseCode}</h3>
                        <Badge variant="outline">{course.courseType}</Badge>
                        <Badge variant="secondary">{course.courseCredit} Credits</Badge>
                      </div>
                      <p className="text-foreground mb-2">{course.courseTitle}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Faculty: {course.courseFaculty}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Room: {course.courseRoomNo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Slots:</span>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {course.courseSlot.map((slot, slotIndex) => (
                          <Badge key={slotIndex} variant="outline" className="text-xs">
                            {slot}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
