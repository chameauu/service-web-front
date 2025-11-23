"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Copy, Check } from "lucide-react"
import Link from "next/link"

export default function AddDevicePage() {
  const router = useRouter()
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
      // TODO: Submit to API
      console.log("Register device:", formData)
      // Simulate API key generation
      const newApiKey = `iot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setApiKey(newApiKey)
    } catch (err) {
      console.error("Device registration failed:", err)
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

  if (apiKey) {
    return (
      <>
        <Navbar />
        <main className="pt-20">
          <div className="p-6 max-w-2xl">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
              <ChevronLeft className="w-4 h-4" />
              Back to Devices
            </Link>

            <Card className="border-status-online">
              <CardHeader>
                <CardTitle>Device Registered Successfully</CardTitle>
                <CardDescription>Your device has been created. Save your API key below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="text-sm text-muted-foreground mb-2">API Key (save this securely)</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm break-all">{apiKey}</code>
                    <Button size="sm" variant="outline" onClick={handleCopyApiKey}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium">
                    This API key will not be shown again. Keep it in a secure location.
                  </p>
                </div>

                <Button onClick={() => router.push("/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="p-6 max-w-2xl">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ChevronLeft className="w-4 h-4" />
            Back to Devices
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Register New Device</CardTitle>
              <CardDescription>Add a new IoT device to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="w-full px-3 py-2 border border-input rounded-md"
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
                    className="w-full px-3 py-2 border border-input rounded-md"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register Device"}
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
