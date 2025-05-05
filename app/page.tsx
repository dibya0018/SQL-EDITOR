import { LoginForm } from "@/components/login-form"
import { LoginHeader } from "@/components/login-header"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <LoginHeader />
      <div className="flex flex-col items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-[#205375] dark:text-[#40a9ff]">Login to Admin Portal</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Enter your credentials to access the system</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
