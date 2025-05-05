"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SiteLogo } from "@/components/site-logo"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import Image from "next/image"

export function DashboardHeader() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    // In a real app, you would clear authentication state
    router.push("/")
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Image
              src="/logo-hbch-mpmmcc.png"
              alt="Homi Bhabha Cancer Hospital & MPMMCC Logo"
              className="h-16 w-auto"
              height={48}
              width={240}
              priority
            />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavItem href="/dashboard" label="Dashboard" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="ml-4 text-[#205375] border-[#205375] hover:bg-[#205375] hover:text-white dark:text-[#40a9ff] dark:border-[#40a9ff] dark:hover:bg-[#40a9ff] dark:hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-2">
              <MobileNavItem href="/dashboard" label="Dashboard" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="mt-4 text-[#205375] border-[#205375] hover:bg-[#205375] hover:text-white dark:text-[#40a9ff] dark:border-[#40a9ff] dark:hover:bg-[#40a9ff] dark:hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-gray-700 dark:text-gray-100 hover:text-[#205375] dark:hover:text-[#40a9ff] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
    >
      {label}
    </Link>
  )
}

function MobileNavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="px-3 py-2 text-gray-700 dark:text-gray-100 hover:text-[#205375] dark:hover:text-[#40a9ff] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
      {label}
    </Link>
  )
}
