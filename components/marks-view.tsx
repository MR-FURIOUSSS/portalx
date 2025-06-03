"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { GraduationCap, Trophy } from "lucide-react"

interface Mark {
  exam: string
  obtained: string
  maxMark: string
}

interface MarksData {
  course: string
  category: string
  marks: Mark[]
  total: {
    obtained: number
    maxMark: number
  }
}

interface MarksViewProps {
  token: string
}

export function MarksView({ token }: MarksViewProps) {
  const [marks, setMarks] = useState<MarksData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMarks()
  }, [])

  const fetchMarks = async () => {
    try {
      const response = await fetch("/api/marks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch marks")
      }

      const data = await response.json()
      setMarks(data.markList || [])
    } catch (error) {
      setError("Failed to load marks data")
    } finally {
      setIsLoading(false)
    }
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A+", color: "bg-green-400" }
    if (percentage >= 80) return { grade: "A", color: "bg-green-400" }
    if (percentage >= 70) return { grade: "B+", color: "bg-blue-400" }
    if (percentage >= 60) return { grade: "B", color: "bg-blue-400" }
    if (percentage >= 50) return { grade: "C", color: "bg-yellow-500" }
    return { grade: "F", color: "bg-red-500" }
  }

  const overallStats = marks.reduce(
    (acc, item) => {
      acc.totalObtained += item.total.obtained
      acc.totalMax += item.total.maxMark
      return acc
    },
    { totalObtained: 0, totalMax: 0 },
  )

  const overallPercentage =
    overallStats.totalMax > 0 ? Math.round((overallStats.totalObtained / overallStats.totalMax) * 100) : 0

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
            <GraduationCap className="h-5 w-5" />
            <span>Academic Performance</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">Your marks and grades overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{overallPercentage}%</div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{getGrade(overallPercentage).grade}</div>
              <p className="text-sm text-muted-foreground">Overall Grade</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{marks.length}</div>
              <p className="text-sm text-muted-foreground">Total Subjects</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">
                {overallStats.totalObtained}/{overallStats.totalMax}
              </div>
              <p className="text-sm text-muted-foreground">Total Marks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Marks */}
      <div className="grid gap-4">
        {marks.map((item, index) => {
          const percentage = item.total.maxMark > 0 ? Math.round((item.total.obtained / item.total.maxMark) * 100) : 0
          const gradeInfo = getGrade(percentage)

          return (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg text-foreground">{item.course}</h3>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {item.marks.map((mark, markIndex) => (
                        <div key={markIndex} className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium text-foreground">{mark.exam}</div>
                          <div className="text-lg font-bold text-foreground">
                            {mark.obtained}/{mark.maxMark}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {mark.maxMark > 0
                              ? Math.round((Number.parseFloat(mark.obtained) / Number.parseFloat(mark.maxMark)) * 100)
                              : 0}
                            %
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold text-foreground">{percentage}%</span>
                    </div>
                    <Badge className={`${gradeInfo.color} text-white`}>Grade {gradeInfo.grade}</Badge>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {item.total.obtained}/{item.total.maxMark}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Performance</span>
                    <span className="text-foreground">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
