"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Cpu, Video, Droplet } from "lucide-react"
import { useState } from "react"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"

interface Device {
  id: string
  name: string
  type: string
  status: "online" | "offline" | "maintenance"
  lastSeen: string
  location?: string
}

interface DeviceListProps {
  devices: Device[]
  isLoading: boolean
}

export function DeviceList({ devices, isLoading }: DeviceListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null)

  const deleteConfirm = useConfirmDialog({
    title: "Delete Device",
    description: "Are you sure you want to delete this device? This action cannot be undone.",
    confirmText: "Delete",
    cancelText: "Cancel",
    isDangerous: true,
    onConfirm: async () => {
      // TODO: Send DELETE request to /api/v1/devices/{deviceToDelete}
      console.log("Delete device:", deviceToDelete)
      setDeviceToDelete(null)
    },
  })

  if (isLoading) {
    return <div className="text-center py-8 text-gray-600">Loading devices...</div>
  }

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage)
  const paginatedDevices = filteredDevices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "camera":
      case "security camera":
        return <Video className="w-5 h-5 text-purple-600" />
      case "sensor":
      case "temperature":
        return <Cpu className="w-5 h-5 text-blue-600" />
      case "moisture":
      case "plant monitor":
        return <Droplet className="w-5 h-5 text-green-600" />
      default:
        return <Cpu className="w-5 h-5 text-blue-600" />
    }
  }

  const getIconColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "camera":
      case "security camera":
        return "bg-purple-100"
      case "sensor":
      case "temperature":
        return "bg-blue-100"
      case "moisture":
      case "plant monitor":
        return "bg-green-100"
      default:
        return "bg-blue-100"
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
    switch (status) {
      case "online":
        return `${baseClasses} bg-green-100 text-green-800`
      case "offline":
        return `${baseClasses} bg-red-100 text-red-800`
      case "maintenance":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with title and controls */}
      <div className="px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">All Devices</h1>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/add-device">
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
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Table */}
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
                {paginatedDevices.map((device) => (
                  <tr key={device.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`${getIconColor(device.type)} flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center`}
                        >
                          {getDeviceIcon(device.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-medium text-gray-900">{device.name}</div>
                          <div className="text-sm text-gray-500">ID: {device.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-base text-gray-500">{device.type}</td>
                    <td className="px-6 py-6 whitespace-nowrap text-base text-gray-500">{device.location || "N/A"}</td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className={getStatusBadge(device.status)}>
                        {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-base text-gray-500">{device.lastSeen}</td>
                    <td className="px-6 py-6 whitespace-nowrap text-base font-medium space-x-4">
                      <Link href={`/device/${device.id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                      <Link href={`/device/${device.id}/edit`} className="text-gray-600 hover:text-gray-900">
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setDeviceToDelete(device.id)
                          deleteConfirm.open()
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
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
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      <deleteConfirm.Dialog />
    </div>
  )
}
