import { LoginForm } from "@/components/login-form"
import { SiteLogo } from "@/components/site-logo"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image
            src="/login.png"
            alt="Login Logo"
            className="h-25 w-25"
            height={70}
            width={140}
            priority
          />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#205375]">Login to Admin Portal</h1>
          <p className="text-center text-gray-600 mb-6">Enter your credentials to access the system</p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
