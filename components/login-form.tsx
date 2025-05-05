"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push("/dashboard")
      } else {
        setError(data.error || "Login failed. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="border-gray-300 dark:border-gray-600 focus:border-[#205375] dark:focus:border-[#40a9ff] focus:ring-[#205375] dark:focus:ring-[#40a9ff] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="border-gray-300 dark:border-gray-600 focus:border-[#205375] dark:focus:border-[#40a9ff] focus:ring-[#205375] dark:focus:ring-[#40a9ff] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="remember" className="border-gray-300 dark:border-gray-600" />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-gray-700 dark:text-gray-200">
            Remember me
          </Label>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#205375] dark:bg-[#40a9ff] hover:bg-[#112B3C] dark:hover:bg-[#1890ff] text-white" 
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="text-center">
          <a href="https://mpmmcc.tmc.gov.in/" className="text-[#205375] dark:text-[#40a9ff] text-sm hover:underline">
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  )
}
