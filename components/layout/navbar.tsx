"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface NavbarProps {
  isAdmin?: boolean
}

export function Navbar({ isAdmin }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userData")
    localStorage.removeItem("authToken")
    document.cookie = "authToken=; path=/; max-age=0"
    router.push("/")
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")
  const userIsAdmin = user?.is_admin === true

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              IoT
            </div>
            <span className="font-semibold text-gray-800">IoTFlow</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`font-medium transition-colors ${
                isActive("/dashboard")
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/devices"
              className={`font-medium transition-colors ${
                isActive("/devices")
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Devices
            </Link>
            {userIsAdmin && (
              <Link
                href="/admin/users"
                className={`font-medium transition-colors ${
                  isActive("/admin")
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Users
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="Settings">
            <Settings className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
