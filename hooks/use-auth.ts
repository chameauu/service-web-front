"use client"

import { useCallback, useEffect, useState } from "react"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("userData")

    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }

    setIsLoading(false)
  }, [])

  const login = useCallback((token: string, userData: any) => {
    localStorage.setItem("authToken", token)
    localStorage.setItem("userData", JSON.stringify(userData))
    
    // Set cookie for middleware authentication
    document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userData")
    
    // Clear cookie
    document.cookie = "authToken=; path=/; max-age=0"
    
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  }
}
