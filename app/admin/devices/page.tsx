"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit2, Trash2 } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"

interface AdminDevice {
  id: string
  name: string
  owner: string
  type: string
  status: "online" | "offline" | "maintenance"
  lastSeen: string
  location: string
}

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<AdminDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch all devices from API
    setDevices([
      {
        id: "1",
        name: "Temperature Sensor - Office",
        owner: "john_doe",
        type: "Sensor",
        status: "online",
        lastSeen: "2 minutes ago",
        location: "Office Building A",
      },
      {
        id: "2",
        name: "Humidity Monitor - Lab",
        owner: "jane_smith",
        type: "Sensor",
        status: "online",
        lastSeen: "5 minutes ago",
        location: "Lab 2",
      },
      {
        id: "3",
        name: "Pressure Gauge - Storage",
        owner: "john_doe",
        type: "Sensor",
        status: "offline",
        lastSeen: "1 hour ago",
        location: "Storage Room",
      },
      {
        id: "4",
        name: "Smart Thermostat",
        owner: "bob_wilson",
        type: "Actuator",
        status: "maintenance",
        lastSeen: "30 minutes ago",
        location: "Building B",
      },
    ])
    setIsLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "default"
      case "offline":
        return "secondary"
      case "maintenance":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <>
      <Navbar isAdmin={true} />
      <main className="pt-20">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">All Devices</h1>
            <p className="text-muted-foreground">Monitor and manage all devices in the system</p>
          </div>

          {isLoading ? (
            <Card className="p-6 text-center text-muted-foreground">Loading devices...</Card>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <Card key={device.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `var(--color-status-${device.status})`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{device.name}</h3>
                          <Badge variant="outline" className="flex-shrink-0">
                            {device.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Owner: <span className="font-medium">{device.owner}</span> • {device.location} •{" "}
                          {device.lastSeen}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <Button variant="ghost" size="sm" title="View">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
