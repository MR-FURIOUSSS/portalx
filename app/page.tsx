"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { LoadingSpinner } from "@/components/loading-spinner"

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

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const storedToken = localStorage.getItem("srm_token")
    const storedUser = localStorage.getItem("srm_user")

    if (storedToken && storedUser) {
      try {
        // Validate token by making a simple API call
        const response = await fetch("/api/cache/status", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        if (response.ok) {
          setIsAuthenticated(true)
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem("srm_token")
          localStorage.removeItem("srm_user")
        }
      } catch (error) {
        console.error("Token validation error:", error)
        localStorage.removeItem("srm_token")
        localStorage.removeItem("srm_user")
      }
    }

    setIsLoading(false)
  }

  const handleLoginSuccess = (userData: User, userToken: string, username: string) => {
    setIsAuthenticated(true)
    setUser(userData)
    setToken(userToken)
    localStorage.setItem("srm_token", userToken)
    localStorage.setItem("srm_user", JSON.stringify(userData))
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
      setToken(null)
      localStorage.removeItem("srm_token")
      localStorage.removeItem("srm_user")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {!isAuthenticated ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard user={user!} token={token!} onLogout={handleLogout} />
      )}
    </div>
  )
}
