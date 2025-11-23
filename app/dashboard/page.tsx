"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { AddDeviceModal } from "@/components/devices/add-device-modal"
import { GroupFilter } from "@/components/devices/group-filter"
import { CreateGroupModal } from "@/components/devices/create-group-modal"
import { AddToGroupButton } from "@/components/devices/add-to-group-button"
import { Plus, Cpu, Activity, AlertCircle, PenTool as Tool, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/utils/api"

interface Device {
  id: number
  name: string
  device_type: string
  status: string
  last_seen: string | null
  location?: string
  description?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [filteredDevicesByGroup, setFilteredDevicesByGroup] = useState<Device[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
      return
    }

    if (isAuthenticated && user) {
      fetchDevices()
    }
  }, [isLoading, isAuthenticated, user, router])

  const fetchDevices = async () => {
    if (!user?.user_id) return
    
    try {
      setLoading(true)
      
      // Admin users see all devices, regular users see only their devices
      let response
      if (user.is_admin) {
        response = await api.getAllDevices()
      } else {
        response = await api.getDevices(user.user_id)
      }
      
      setDevices(response.devices || [])
      
      // If a group is selected, fetch group devices
      if (selectedGroupId) {
        await fetchGroupDevices(selectedGroupId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch devices")
      console.error("Error fetching devices:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroupDevices = async (groupId: number) => {
    if (!user?.user_id) return
    
    try {
      const response = await api.getGroup(groupId.toString(), user.user_id, true)
      setFilteredDevicesByGroup(response.group?.devices || [])
    } catch (err) {
      console.error("Error fetching group devices:", err)
      // Backend not ready yet, clear filter
      setFilteredDevicesByGroup([])
      setSelectedGroupId(null)
    }
  }

  const handleGroupSelect = async (groupId: number | null) => {
    setSelectedGroupId(groupId)
    if (groupId) {
      await fetchGroupDevices(groupId)
    } else {
      setFilteredDevicesByGroup([])
    }
  }

  const handleGroupCreated = () => {
    // Refresh can be handled by the GroupFilter component
  }

  // Use group-filtered devices if a group is selected, otherwise use all devices
  const devicesToDisplay = selectedGroupId ? filteredDevicesByGroup : devices

  const totalDevices = devicesToDisplay.length
  const onlineCount = devicesToDisplay.filter((d) => d.status?.toLowerCase() === "active" || d.status?.toLowerCase() === "online").length
  const offlineCount = devicesToDisplay.filter((d) => d.status?.toLowerCase() === "inactive" || d.status?.toLowerCase() === "offline").length
  const maintenanceCount = devicesToDisplay.filter((d) => d.status?.toLowerCase() === "maintenance" || d.status?.toLowerCase() === "error").length

  const filteredDevices = devicesToDisplay.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.device_type?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === "active" || statusLower === "online") {
      return "bg-green-100 text-green-800"
    }
    if (statusLower === "inactive" || statusLower === "offline") {
      return "bg-red-100 text-red-800"
    }
    if (statusLower === "maintenance" || statusLower === "error") {
      return "bg-yellow-100 text-yellow-800"
    }
    return "bg-gray-100 text-gray-800"
  }

  const getIconColor = (type: string) => {
    const typeLower = type?.toLowerCase()
    if (typeLower?.includes("temperature") || typeLower?.includes("temp")) return "text-red-500"
    if (typeLower?.includes("camera")) return "text-blue-500"
    if (typeLower?.includes("moisture") || typeLower?.includes("humidity")) return "text-green-500"
    if (typeLower?.includes("pressure")) return "text-purple-500"
    if (typeLower?.includes("sensor")) return "text-orange-500"
    return "text-gray-500"
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Never"
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading devices...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Device Dashboard</h1>
            {user && <p className="text-gray-600 mt-1">Welcome back, {user.username}!</p>}
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDeviceOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 font-medium">Total Devices</h3>
              <Cpu className="text-blue-500 w-6 h-6" />
            </div>
            <p className="text-3xl font-bold mt-2">{totalDevices}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 font-medium">Online</h3>
              <Activity className="text-green-500 w-6 h-6" />
            </div>
            <p className="text-3xl font-bold mt-2">{onlineCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 font-medium">Offline</h3>
              <AlertCircle className="text-red-500 w-6 h-6" />
            </div>
            <p className="text-3xl font-bold mt-2">{offlineCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-500 font-medium">Maintenance</h3>
              <Tool className="text-yellow-500 w-6 h-6" />
            </div>
            <p className="text-3xl font-bold mt-2">{maintenanceCount}</p>
          </div>
        </div>

        {/* Device Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Your Devices</h2>
              <div className="flex items-center gap-4">
                {user && (
                  <GroupFilter
                    userId={user.user_id}
                    selectedGroupId={selectedGroupId}
                    onGroupSelect={handleGroupSelect}
                    onCreateGroup={() => setIsCreateGroupOpen(true)}
                  />
                )}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Device Name
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Last Seen
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDevices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center">
                        <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {searchQuery ? "No devices found matching your search" : "No devices registered yet"}
                        </p>
                        {!searchQuery && (
                          <Button 
                            className="mt-4 bg-blue-600 hover:bg-blue-700" 
                            onClick={() => setIsAddDeviceOpen(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Device
                          </Button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredDevices.map((device) => (
                      <tr key={device.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 h-12 w-12 ${getStatusColor(device.status)} bg-opacity-20 rounded-full flex items-center justify-center`}
                            >
                              <Cpu className={`${getIconColor(device.device_type)} w-6 h-6`} />
                            </div>
                            <div className="ml-4">
                              <div className="text-base font-medium text-gray-900">{device.name}</div>
                              <div className="text-sm text-gray-500">{device.location || "No location"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-base text-gray-500">
                          {device.device_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(device.status)}`}
                          >
                            {device.status?.charAt(0).toUpperCase() + device.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-base text-gray-500">
                          {formatLastSeen(device.last_seen)}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-base font-medium">
                          <div className="flex items-center gap-2">
                            <a href={`/device/${device.id}`} className="text-blue-600 hover:text-blue-900">
                              View
                            </a>
                            <span className="text-gray-300">|</span>
                            <a href={`/device/${device.id}/edit`} className="text-gray-600 hover:text-gray-900">
                              Edit
                            </a>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => handleDeleteDevice(device.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                            {user && (
                              <>
                                <span className="text-gray-300">|</span>
                                <AddToGroupButton
                                  deviceId={device.id}
                                  userId={user.user_id}
                                  onGroupsUpdated={fetchDevices}
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Device Modal */}
      <AddDeviceModal 
        open={isAddDeviceOpen} 
        onOpenChange={setIsAddDeviceOpen}
        onDeviceAdded={fetchDevices}
      />

      {/* Create Group Modal */}
      {user && (
        <CreateGroupModal
          open={isCreateGroupOpen}
          onOpenChange={setIsCreateGroupOpen}
          userId={user.user_id}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  )
}

async function handleDeleteDevice(deviceId: number) {
  if (!confirm("Are you sure you want to delete this device?")) return
  
  try {
    await api.deleteDevice(deviceId.toString())
    window.location.reload() // Refresh the page
  } catch (err) {
    alert(err instanceof Error ? err.message : "Failed to delete device")
  }
}
