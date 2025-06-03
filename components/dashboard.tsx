"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AttendanceView } from "@/components/attendance-view"
import { MarksView } from "@/components/marks-view"
import { TimetableView } from "@/components/timetable-view"
import { CourseView } from "@/components/course-view"
import { CalendarView } from "@/components/calendar-view"
import { CacheIndicator } from "@/components/cache-indicator"
import { LogOut, BookOpen, Calendar, Clock, GraduationCap, BarChart3, Moon, Sun, RefreshCw, Menu } from "lucide-react"
import { LucideUser } from "lucide-react"
import { useTheme } from "next-themes"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  name: string
  regNumber: string
  mobile: string
  department: string
  program: string
  section: string
  semester: string
  batch: string
}

interface DashboardProps {
  user: User
  token: string
  onLogout: () => void
}

export function Dashboard({ user, token, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const { theme, setTheme } = useTheme()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleClearAllCache = async () => {
    setIsRefreshing(true)
    setRefreshError("")

    try {
      const response = await fetch("/api/cache/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dataType: "all" }),
      })

      if (!response.ok) {
        throw new Error("Failed to clear cache")
      }

      // Force reload the current tab
      window.location.reload()
    } catch (error) {
      console.error("Error clearing cache:", error)
      setRefreshError("Failed to refresh data. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: LucideUser },
    { id: "attendance", label: "Attendance", icon: BarChart3 },
    { id: "marks", label: "Marks", icon: GraduationCap },
    { id: "timetable", label: "Timetable", icon: Clock },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "calendar", label: "Calendar", icon: Calendar },
  ]

  const MobileSidebar = () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center space-x-3 pb-4 border-b border-border">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary text-lg">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.regNumber}</p>
        </div>
      </div>

      <CacheIndicator token={token} className="w-full" />

      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAllCache}
          disabled={isRefreshing}
          className="w-full justify-start"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>

        <Button variant="outline" size="sm" onClick={onLogout} className="w-full justify-start">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="bg-card shadow-sm border-b border-border lg:hidden">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">SRM Academia</h1>
              <p className="text-xs text-muted-foreground">Student Portal</p>
            </div>
          </div>

          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <MobileSidebar />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="bg-card shadow-sm border-b border-border hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px:8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">SRM Academia</h1>
                <p className="text-sm text-muted-foreground">Student Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllCache}
                disabled={isRefreshing}
                className="border-border"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="border-border"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.regNumber}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={onLogout} className="border-border">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {refreshError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{refreshError}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 space-y-4">
            <CacheIndicator token={token} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
              {/* Mobile Tab Navigation - Horizontal Scroll */}
              <div className="lg:hidden">
                <TabsList className="grid grid-cols-3 h-auto p-1 bg-muted/50">
                  {tabs.slice(0, 3).map((tab) => {
                    const Icon = tab.icon
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex flex-col items-center space-y-1 py-2 px-1 data-[state=active]:bg-background text-xs"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{tab.label}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
                <TabsList className="grid grid-cols-3 h-auto p-1 bg-muted/50 mt-1">
                  {tabs.slice(3).map((tab) => {
                    const Icon = tab.icon
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex flex-col items-center space-y-1 py-2 px-1 data-[state=active]:bg-background text-xs"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{tab.label}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>

              {/* Desktop Tab Navigation */}
              <div className="hidden lg:block">
                <TabsList className="grid w-full grid-cols-6 bg-muted">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center space-x-2 data-[state=active]:bg-background"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>

              <TabsContent value="profile" className="space-y-4 lg:space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-foreground text-lg lg:text-xl">
                      <LucideUser className="h-5 w-5" />
                      <span>Student Profile</span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      Your academic information and details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                          <p className="text-base lg:text-lg font-semibold text-foreground break-words">{user.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                          <p className="text-base lg:text-lg font-semibold text-foreground break-all">
                            {user.regNumber}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
                          <p className="text-base lg:text-lg font-semibold text-foreground">{user.mobile}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Department</label>
                          <p className="text-base lg:text-lg font-semibold text-foreground break-words">
                            {user.department}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Program</label>
                          <Badge variant="secondary" className="text-sm">
                            {user.program}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Section</label>
                          <Badge variant="outline" className="text-sm">
                            Section {user.section}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Semester</label>
                          <Badge variant="default" className="text-sm">
                            Semester {user.semester}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Batch</label>
                          <Badge variant="secondary" className="text-sm">
                            Batch {user.batch}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile Cache Indicator */}
                <div className="lg:hidden">
                  <CacheIndicator token={token} />
                </div>
              </TabsContent>

              <TabsContent value="attendance">
                <AttendanceView token={token} key={`attendance-${isRefreshing}`} />
              </TabsContent>

              <TabsContent value="marks">
                <MarksView token={token} key={`marks-${isRefreshing}`} />
              </TabsContent>

              <TabsContent value="timetable">
                <TimetableView token={token} key={`timetable-${isRefreshing}`} />
              </TabsContent>

              <TabsContent value="courses">
                <CourseView token={token} key={`courses-${isRefreshing}`} />
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarView token={token} key={`calendar-${isRefreshing}`} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
