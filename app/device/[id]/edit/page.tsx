"use client"

import type React from "react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function EditDevicePage() {
  const params = useParams()
  const router = useRouter()
  const deviceId = params.id as string

  const [formData, setFormData] = useState({
    name: "Temperature Sensor - Office",
    description: "Main temperature monitoring sensor for the office HVAC system",
    location: "Office Building A, Floor 3",
    firmwareVersion: "2.1.0",
    hardwareVersion: "1.0",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!formData.name) {
        setError("Device name is required")
        return
      }

      // TODO: Submit update to API at /api/v1/devices/{device_id}
      console.log("Update device:", { id: deviceId, ...formData })
      router.push(`/device/${deviceId}`)
    } catch (err) {
      setError("Failed to update device. Please try again.")
      console.error("Update failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="p-6 max-w-2xl">
          <Link
            href={`/device/${deviceId}`}
            className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Device
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Edit Device</CardTitle>
              <CardDescription>Update device information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Name</label>
                  <Input name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input name="location" value={formData.location} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Firmware Version</label>
                  <Input name="firmwareVersion" value={formData.firmwareVersion} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hardware Version</label>
                  <Input name="hardwareVersion" value={formData.hardwareVersion} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
