"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Eye, EyeOff, GraduationCap } from "lucide-react"

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

interface LoginFormProps {
  onLoginSuccess: (user: User, token: string, username: string) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [captcha, setCaptcha] = useState("")
  const [captchaImage, setCaptchaImage] = useState("")
  const [captchaDigest, setCaptchaDigest] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showCaptcha, setShowCaptcha] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          ...(showCaptcha && { captcha, captchaDigest }),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem("srm_user", JSON.stringify(data.user))
        onLoginSuccess(data.user, data.token, username)
      } else if (data.requiresCaptcha) {
        setShowCaptcha(true)
        setCaptchaImage(data.captcha.image)
        setCaptchaDigest(data.captcha.digest)
        setError("Please solve the CAPTCHA to continue")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">SRM Academia</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your academic information
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-background border-border text-foreground h-11"
              />
              <p className="text-xs text-muted-foreground">Your SRM email (e.g., student@srmist.edu.in)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background border-border text-foreground h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {showCaptcha && (
              <div className="space-y-3">
                <Label htmlFor="captcha" className="text-foreground text-sm font-medium">
                  CAPTCHA
                </Label>
                {captchaImage && (
                  <div className="flex justify-center p-4 bg-muted rounded-lg">
                    <img
                      src={`data:image/png;base64,${captchaImage}`}
                      alt="CAPTCHA"
                      className="border rounded border-border max-w-full h-auto"
                    />
                  </div>
                )}
                <Input
                  id="captcha"
                  type="text"
                  placeholder="Enter CAPTCHA text"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  required={showCaptcha}
                  className="bg-background border-border text-foreground h-11"
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
