"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check } from "lucide-react"

interface AddDeviceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeviceAdded?: () => void
}

export function AddDeviceModal({ open, onOpenChange, onDeviceAdded }: AddDeviceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Sensor",
    location: "",
    firmwareVersion: "1.0.0",
    hardwareVersion: "1.0",
  })
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get user data from localStorage
      const userData = localStorage.getItem("userData")
      if (!userData) {
        throw new Error("User not authenticated")
      }
      const user = JSON.parse(userData)

      // Call the API to register device
      const { api } = await import("@/utils/api")
      const response = await api.createDevice({
        name: formData.name,
        device_type: formData.type.toLowerCase(),
        user_id: user.user_id, // UUID string
        description: formData.description,
        location: formData.location,
      })

      // Set the API key from response
      if (response.device && response.device.api_key) {
        setApiKey(response.device.api_key)
      } else {
        throw new Error("No API key returned from server")
      }
    } catch (err) {
      console.error("Device registration failed:", err)
      alert(err instanceof Error ? err.message : "Failed to register device")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      type: "Sensor",
      location: "",
      firmwareVersion: "1.0.0",
      hardwareVersion: "1.0",
    })
    setApiKey(null)
    setCopied(false)
    onOpenChange(false)
    
    // Call the callback to refresh device list
    if (onDeviceAdded) {
      onDeviceAdded()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        {apiKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Device Registered Successfully</DialogTitle>
              <DialogDescription>Your device has been created. Save your API key below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">API Key (save this securely)</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm break-all text-gray-800">{apiKey}</code>
                  <Button size="sm" variant="outline" onClick={handleCopyApiKey}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium">
                  This API key will not be shown again. Keep it in a secure location.
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Register New Device</DialogTitle>
              <DialogDescription>Add a new IoT device to your account</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Name *</label>
                  <Input
                    name="name"
                    placeholder="e.g., Office Temperature Sensor"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>Sensor</option>
                    <option>Actuator</option>
                    <option>Gateway</option>
                    <option>Controller</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    name="location"
                    placeholder="e.g., Office Building A, Floor 3"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Firmware Version</label>
                  <Input
                    name="firmwareVersion"
                    placeholder="e.g., 1.0.0"
                    value={formData.firmwareVersion}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hardware Version</label>
                  <Input
                    name="hardwareVersion"
                    placeholder="e.g., 1.0"
                    value={formData.hardwareVersion}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the purpose and location of this device"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register Device"}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
