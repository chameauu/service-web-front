"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { GroupFilter } from "@/components/devices/group-filter"
import { CreateGroupModal } from "@/components/devices/create-group-modal"
import { AddToGroupButton } from "@/components/devices/add-to-group-button"
import { Cpu, Video, Droplet, Thermometer, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/utils/api"

interface Device {
  id: number
  name: string
  device_type: string
  location?: string
  status: string
  last_seen: string | null
  description?: string
}

export default function DevicesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [filteredDevicesByGroup, setFilteredDevicesByGroup] = useState<Device[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

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
    setCurrentPage(1) // Reset to first page
    if (groupId) {
      await fetchGroupDevices(groupId)
    } else {
      setFilteredDevicesByGroup([])
    }
  }

  const handleGroupCreated = () => {
    // Refresh will be handled by GroupFilter component
  }

  // Use group-filtered devices if a group is selected, otherwise use all devices
  const devicesToDisplay = selectedGroupId ? filteredDevicesByGroup : devices

  // Calculate statistics
  const totalDevices = devicesToDisplay.length
  const onlineCount = devicesToDisplay.filter((d) => d.status?.toLowerCase() === "active" || d.status?.toLowerCase() === "online").length
  const offlineCount = devicesToDisplay.filter((d) => d.status?.toLowerCase() === "inactive" || d.status?.toLowerCase() === "offline").length
  const maintenanceCount = devicesToDisplay.filter((d) => d.status?.toLowerCase() === "maintenance" || d.status?.toLowerCase() === "error").length

  // Filter devices by search term
  const filteredDevices = devicesToDisplay.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.device_type?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage)
  const paginatedDevices = filteredDevices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getDeviceIcon = (type: string) => {
    const iconClass = "w-6 h-6"
    const typeLower = type?.toLowerCase()
    if (typeLower?.includes("camera")) return <Video className={`${iconClass} text-blue-500`} />
    if (typeLower?.includes("temperature") || typeLower?.includes("temp")) return <Thermometer className={`${iconClass} text-red-500`} />
    if (typeLower?.includes("moisture") || typeLower?.includes("humidity")) return <Droplet className={`${iconClass} text-green-500`} />
    return <Cpu className={`${iconClass} text-blue-500`} />
  }

  const getIconBgColor = (type: string) => {
    const typeLower = type?.toLowerCase()
    if (typeLower?.includes("camera")) return "bg-blue-100"
    if (typeLower?.includes("temperature") || typeLower?.includes("temp")) return "bg-red-100"
    if (typeLower?.includes("moisture") || typeLower?.includes("humidity")) return "bg-green-100"
    return "bg-blue-100"
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
    const statusLower = status?.toLowerCase()
    if (statusLower === "active" || statusLower === "online") {
      return `${baseClasses} bg-green-100 text-green-800`
    }
    if (statusLower === "inactive" || statusLower === "offline") {
      return `${baseClasses} bg-red-100 text-red-800`
    }
    if (statusLower === "maintenance" || statusLower === "error") {
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    }
    return `${baseClasses} bg-gray-100 text-gray-800`
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
      <div className="bg-gray-50 min-h-screen">
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
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <main className="px-0 py-8">
        <div className="container mx-auto px-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">All Devices</h1>
              <p className="text-gray-600 mt-1">{totalDevices} device{totalDevices !== 1 ? 's' : ''} registered</p>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <GroupFilter
                  userId={user.user_id}
                  selectedGroupId={selectedGroupId}
                  onGroupSelect={handleGroupSelect}
                  onCreateGroup={() => setIsCreateGroupOpen(true)}
                />
              )}
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <span className="mr-2">+</span> Add Device
                </Button>
              </Link>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="container mx-auto px-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Device
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Update
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDevices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchTerm ? "No devices found matching your search" : "No devices registered yet"}
                      </p>
                      {!searchTerm && (
                        <Link href="/dashboard">
                          <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                            <span className="mr-2">+</span> Add Your First Device
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedDevices.map((device) => (
                    <tr key={device.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`${getIconBgColor(device.device_type)} flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center`}
                          >
                            {getDeviceIcon(device.device_type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-base font-medium text-gray-900">{device.name}</div>
                            <div className="text-sm text-gray-500">ID: {device.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-base text-gray-500">
                        {device.device_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-base text-gray-500">
                        {device.location || "No location"}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span className={getStatusBadge(device.status)}>
                          {device.status?.charAt(0).toUpperCase() + device.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-base text-gray-500">
                        {formatLastSeen(device.last_seen)}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-base font-medium">
                        <div className="flex items-center gap-2">
                          <Link href={`/device/${device.id}`} className="text-blue-600 hover:text-blue-900">
                            View
                          </Link>
                          <span className="text-gray-300">|</span>
                          <Link href={`/device/${device.id}/edit`} className="text-gray-600 hover:text-gray-900">
                            Edit
                          </Link>
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

          {paginatedDevices.length > 0 && (
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {paginatedDevices.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                    </span>{" "}
                    to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredDevices.length)}</span>{" "}
                    of <span className="font-medium">{filteredDevices.length}</span> devices
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`${
                          page === currentPage
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

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
