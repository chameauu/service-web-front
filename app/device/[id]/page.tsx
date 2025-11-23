"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, RefreshCw, Edit2, Trash2, Activity, MapPin, Cpu, HardDrive, Table, LineChart } from "lucide-react"
import Link from "next/link"
import { TelemetryChart } from "@/components/charts/telemetry-chart"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"

interface DeviceDetails {
  id: string
  name: string
  type: string
  status: "online" | "offline" | "maintenance"
  location: string
  firmwareVersion: string
  hardwareVersion: string
  lastSeen: string
  description?: string
}

interface TelemetryData {
  timestamp: string
  temperature?: number
  humidity?: number
  pressure?: number
}

export default function DeviceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const deviceId = params.id as string

  const [device, setDevice] = useState<DeviceDetails | null>(null)
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([])
  const [allTelemetry, setAllTelemetry] = useState<TelemetryData[]>([]) // Store all data
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Get user data
      const userData = localStorage.getItem("userData")
      if (!userData) return
      const user = JSON.parse(userData)
      
      const { api } = await import("@/utils/api")
      const statusResponse = await api.getDeviceStatus(deviceId, user.user_id)
      
      if (statusResponse.device && statusResponse.device.api_key) {
        const telemetryResponse = await api.getTelemetry(deviceId, statusResponse.device.api_key, {
          limit: 100
        })
        
        // Backend returns 'data' array with telemetry records
        const telemetryData = telemetryResponse.data || telemetryResponse.telemetry || []
        if (Array.isArray(telemetryData) && telemetryData.length > 0) {
          const formattedData = telemetryData.map((t: any) => ({
            timestamp: t.timestamp,
            ...t.measurements
          }))
          setAllTelemetry(formattedData) // Store all data
          setTelemetry(filterTelemetryByTimeRange(formattedData, timeRange)) // Apply filter
        } else {
          setAllTelemetry([])
          setTelemetry([])
        }
      }
    } catch (err) {
      console.error("Error refreshing data:", err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleEdit = () => {
    router.push(`/device/${deviceId}/edit`)
  }

  const handleDelete = async () => {
    try {
      const { api } = await import("@/utils/api")
      await api.deleteDevice(deviceId)
      router.push("/dashboard")
    } catch (err) {
      console.error("Delete failed:", err)
      alert(err instanceof Error ? err.message : "Failed to delete device")
    }
  }

  // Filter telemetry data by time range
  const filterTelemetryByTimeRange = (data: TelemetryData[], range: "1h" | "24h" | "7d" | "30d") => {
    if (data.length === 0) return data
    
    const now = new Date()
    const cutoffTime = new Date()
    
    switch (range) {
      case "1h":
        cutoffTime.setHours(now.getHours() - 1)
        break
      case "24h":
        cutoffTime.setHours(now.getHours() - 24)
        break
      case "7d":
        cutoffTime.setDate(now.getDate() - 7)
        break
      case "30d":
        cutoffTime.setDate(now.getDate() - 30)
        break
    }
    
    return data.filter(item => new Date(item.timestamp) >= cutoffTime)
  }

  // Handle time range change
  const handleTimeRangeChange = (range: "1h" | "24h" | "7d" | "30d") => {
    console.log('Time range changed to:', range)
    console.log('All telemetry data count:', allTelemetry.length)
    
    if (allTelemetry.length === 0) {
      console.warn('No telemetry data to filter')
      return
    }
    
    setTimeRange(range)
    const filtered = filterTelemetryByTimeRange(allTelemetry, range)
    console.log('Filtered data count:', filtered.length)
    console.log('Sample filtered data:', filtered.slice(0, 2))
    setTelemetry(filtered)
  }

  // Save chart configuration to database
  const handleSaveChart = async () => {
    let chartData: any = null
    
    try {
      setIsSaving(true)
      
      const userData = localStorage.getItem("userData")
      if (!userData) {
        alert("Please login to save charts")
        return
      }
      const user = JSON.parse(userData)
      
      // Get measurement fields from telemetry data
      const measurements = allTelemetry.length > 0 
        ? Object.keys(allTelemetry[0]).filter(key => key !== 'timestamp' && typeof allTelemetry[0][key] === 'number')
        : []
      
      const { api } = await import("@/utils/api")
      
      console.log('User data:', user)
      console.log('Device:', device)
      console.log('Measurements:', measurements)
      
      chartData = {
        name: `${device?.name || 'Device'} - ${timeRange} Chart`,
        chart_type: "line",
        user_id: user.id,
        description: `Telemetry chart for ${device?.name || 'device'} showing ${measurements.join(', ')}`,
        config: {
          time_range: timeRange,
          measurements: measurements,
          device_id: deviceId
        }
      }
      
      console.log('Creating chart with data:', chartData)
      const response = await api.createChart(chartData)
      console.log('Chart created:', response)
      
      // Add device to chart
      if (response.chart && response.chart.id) {
        await api.addDeviceToChart(response.chart.id.toString(), deviceId)
        
        // Add measurements to chart
        for (const measurement of measurements) {
          await api.addMeasurementToChart(
            response.chart.id.toString(),
            measurement,
            { display_name: measurement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
          )
        }
      }
      
      alert("Chart saved successfully! You can view it in the Charts page.")
    } catch (err) {
      console.error("Error saving chart:", err)
      console.error("Error details:", JSON.stringify(err, null, 2))
      const errorMessage = err instanceof Error ? err.message : "Failed to save chart"
      alert(`Failed to save chart: ${errorMessage}`)
      
      // Log the chart data that failed
      console.error("Failed chart data:", chartData)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-status-online"
      case "offline":
        return "bg-status-offline"
      case "maintenance":
        return "bg-status-maintenance"
      default:
        return "bg-muted"
    }
  }

  const deleteConfirm = useConfirmDialog({
    title: "Delete Device",
    description: "Are you sure you want to delete this device? This action cannot be undone.",
    confirmText: "Delete",
    cancelText: "Cancel",
    isDangerous: true,
    onConfirm: handleDelete,
  })

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setIsLoading(true)
        
        // Get user data for API key
        const userData = localStorage.getItem("userData")
        if (!userData) {
          router.push("/")
          return
        }
        const user = JSON.parse(userData)
        
        // Fetch device status with user_id in header
        const { api } = await import("@/utils/api")
        const statusResponse = await api.getDeviceStatus(deviceId, user.user_id)
        
        if (statusResponse.device) {
          const dev = statusResponse.device
          setDevice({
            id: dev.id.toString(),
            name: dev.name,
            type: dev.device_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Unknown",
            status: dev.status === "active" ? "online" : "offline",
            location: dev.location || "No location set",
            firmwareVersion: dev.firmware_version || "N/A",
            hardwareVersion: dev.hardware_version || "N/A",
            lastSeen: dev.last_seen ? formatLastSeen(dev.last_seen) : "Never",
            description: dev.description || "",
          })
          
          // Fetch telemetry data if device has API key
          if (dev.api_key) {
            try {
              const telemetryResponse = await api.getTelemetry(deviceId, dev.api_key, {
                limit: 100
              })
              
              // Backend returns 'data' array with telemetry records
              const telemetryData = telemetryResponse.data || telemetryResponse.telemetry || []
              if (Array.isArray(telemetryData) && telemetryData.length > 0) {
                const formattedData = telemetryData.map((t: any) => ({
                  timestamp: t.timestamp,
                  ...t.measurements
                }))
                setAllTelemetry(formattedData) // Store all data
                setTelemetry(filterTelemetryByTimeRange(formattedData, timeRange)) // Apply filter
              } else {
                setAllTelemetry([])
                setTelemetry([])
              }
            } catch (telErr) {
              console.error("Error fetching telemetry:", telErr)
              // If no telemetry data, that's okay
              setTelemetry([])
            }
          }
        }
      } catch (err) {
        console.error("Error fetching device:", err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDeviceData()
  }, [deviceId, router])
  
  const formatLastSeen = (lastSeen: string) => {
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

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-20">
          <div className="p-6 text-center text-muted-foreground">Loading device details...</div>
        </main>
      </>
    )
  }

  if (!device) {
    return (
      <>
        <Navbar />
        <main className="pt-20">
          <div className="p-6 text-center text-muted-foreground">Device not found</div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back to Devices
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{device.name}</h1>
                  <p className="text-muted-foreground">{device.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive bg-transparent hover:bg-destructive/10"
                  onClick={deleteConfirm.open}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full`}
                    style={{ backgroundColor: `var(--color-status-${device.status})` }}
                  />
                  <span className="font-semibold capitalize">{device.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{device.lastSeen}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">Type</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{device.type}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">Location</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-sm">{device.location}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-purple-500" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">Firmware</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{device.firmwareVersion}</p>
                <p className="text-xs text-muted-foreground">Hardware: {device.hardwareVersion}</p>
              </CardContent>
            </Card>
          </div>

          {/* Telemetry Data Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle>Latest Telemetry Data</CardTitle>
                  <CardDescription>Recent sensor measurements</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {telemetry.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        {Object.keys(telemetry[0] || {}).filter(key => key !== 'timestamp').map((key) => (
                          <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {telemetry.slice(0, 10).map((data, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(data.timestamp).toLocaleString()}
                          </td>
                          {Object.entries(data).filter(([key]) => key !== 'timestamp').map(([key, value]) => (
                            <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {typeof value === 'number' ? value.toFixed(2) : value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No telemetry data available for this device
                </div>
              )}
            </CardContent>
          </Card>

          {/* Telemetry Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-green-600" />
                  <div>
                    <CardTitle>Telemetry Visualization</CardTitle>
                    <CardDescription>
                      Showing {telemetry.length} of {allTelemetry.length} records ({timeRange})
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(["1h", "24h", "7d", "30d"] as const).map((range) => (
                    <Button
                      key={range}
                      size="sm"
                      variant={timeRange === range ? "default" : "outline"}
                      onClick={() => handleTimeRangeChange(range)}
                    >
                      {range === "1h" && "Last Hour"}
                      {range === "24h" && "Last 24h"}
                      {range === "7d" && "Last 7d"}
                      {range === "30d" && "Last 30d"}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleSaveChart}
                    disabled={isSaving || telemetry.length === 0}
                  >
                    {isSaving ? "Saving..." : "Save Chart"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {telemetry.length > 0 ? (
                <TelemetryChart data={telemetry} />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No telemetry data available for this device
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      {showDeleteConfirm && deleteConfirm.Dialog}
    </>
  )
}
