"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/utils/api"
import { User, Activity, Calendar, Mail, Trash2, Ban, CheckCircle } from "lucide-react"

interface UserData {
  id: number
  user_id: string
  username: string
  email: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  last_login: string | null
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
      return
    }

    if (!isLoading && user && !user.is_admin) {
      router.push("/dashboard")
      return
    }

    if (isAuthenticated && user?.is_admin) {
      fetchUsers()
    }
  }, [isLoading, isAuthenticated, user, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.getUsers()
      
      // Backend returns { status, users, meta }
      if (response.users) {
        setUsers(response.users)
      } else if (Array.isArray(response)) {
        setUsers(response)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  const handleToggleUserStatus = async (userId: string, username: string, isActive: boolean) => {
    const action = isActive ? "deactivate" : "activate"
    if (!confirm(`Are you sure you want to ${action} user "${username}"?`)) {
      return
    }

    try {
      if (isActive) {
        await api.deactivateUser(userId)
      } else {
        await api.activateUser(userId)
      }
      // Refresh the user list
      await fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${action} user`)
      console.error(`Error ${action}ing user:`, err)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.deleteUser(userId)
      // Refresh the user list
      setError("") // Clear any previous errors
      await fetchUsers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user"
      setError(errorMessage)
      alert(errorMessage)
      console.error("Error deleting user:", err)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">View and manage all users in the system</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {users.map((userData) => (
            <Card key={userData.user_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {userData.username}
                        </h3>
                        {userData.is_admin && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            Admin
                          </span>
                        )}
                        {!userData.is_active && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{userData.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(userData.created_at).toLocaleDateString()}</span>
                        </div>
                        {userData.last_login && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            <span>Last login {new Date(userData.last_login).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handleViewUser(userData.user_id)}
                      variant="outline"
                    >
                      View Details
                    </Button>
                    <Button 
                      onClick={() => handleToggleUserStatus(userData.user_id, userData.username, userData.is_active)}
                      variant="outline"
                      className={userData.is_active 
                        ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                        : "text-green-600 hover:text-green-700 hover:bg-green-50"
                      }
                      title={userData.is_active ? "Deactivate user" : "Activate user"}
                    >
                      {userData.is_active ? (
                        <Ban className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleDeleteUser(userData.user_id, userData.username)}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
