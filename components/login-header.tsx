"use client"

import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LoginHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo-hbch-mpmmcc.png"
              alt="Homi Bhabha Cancer Hospital & MPMMCC Logo"
              className="h-16 w-auto"
              height={64}
              width={240}
              priority
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
} 