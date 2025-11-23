"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/utils/api"
import { 
  User, 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Activity, 
  Cpu,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

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

interface Device {
  id: number
  name: string
  device_type: string
  status: string
  location?: string
  last_seen?: string
  created_at: string
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  const { isAuthenticated, isLoading, user } = useAuth()
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
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
      fetchUserData()
    }
  }, [isLoading, isAuthenticated, user, router, userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch user details
      const userResponse = await api.getUser(userId)
      // Backend returns {status, user}
      setUserData(userResponse.user || userResponse)
      
      // Fetch user's devices
      const devicesResponse = await api.getDevices(userId)
      if (devicesResponse.devices) {
        setDevices(devicesResponse.devices)
      } else if (Array.isArray(devicesResponse)) {
        setDevices(devicesResponse)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user data")
      console.error("Error fetching user data:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
        return 'text-green-600 bg-green-100'
      case 'inactive':
      case 'offline':
        return 'text-gray-600 bg-gray-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
        return <CheckCircle className="w-4 h-4" />
      case 'inactive':
      case 'offline':
        return <XCircle className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6 max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/admin/users")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error || "User not found"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const activeDevices = devices.filter(d => d.status?.toLowerCase() === 'active' || d.status?.toLowerCase() === 'online').length
  const totalDevices = devices.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-6 max-w-7xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/admin/users")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{userData.username}</CardTitle>
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
                <CardDescription className="mt-1">User ID: {userData.user_id}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(userData.created_at).toLocaleDateString()}</span>
              </div>
              {userData.last_login && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Activity className="w-4 h-4" />
                  <span>Last login {new Date(userData.last_login).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Devices</CardDescription>
              <CardTitle className="text-3xl">{totalDevices}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Devices</CardDescription>
              <CardTitle className="text-3xl text-green-600">{activeDevices}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Inactive Devices</CardDescription>
              <CardTitle className="text-3xl text-gray-600">{totalDevices - activeDevices}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Devices List */}
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>All devices registered by this user</CardDescription>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <div className="text-center py-12">
                <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No devices registered</p>
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => (
                  <div 
                    key={device.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{device.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <span className="capitalize">{device.device_type?.replace('_', ' ')}</span>
                          {device.location && (
                            <>
                              <span>•</span>
                              <span>{device.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {device.last_seen && (
                        <span className="text-sm text-gray-500">
                          Last seen: {new Date(device.last_seen).toLocaleString()}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(device.status)}`}>
                        {getStatusIcon(device.status)}
                        <span className="capitalize">{device.status || 'Unknown'}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
