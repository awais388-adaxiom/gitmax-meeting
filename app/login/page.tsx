"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/useAuth'
import { Button } from "@/components/ui/button"
import Image from 'next/image';
import icon from "../../icon.png";
import { cn } from "@/lib/utils"; // agar aapke paas utils me cn function hai

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const router = useRouter()
  const { login } = useAuth()

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const success = await login(username, password)
    if (success) {
      showToast("Login successful!", "success")
      setTimeout(() => {
        router.push('/viewMeetings')
      }, 500) // thoda delay toast show hone ke liye
    } else {
      showToast("Invalid username or password", "error")
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="min-w-[400px] w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="flex justify-center">
          <Image src={icon} alt="Logo" width={200} height={200} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <Button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign in
            </Button>
          </div>
        </form>
      </div>

      {/* Custom Toast Notifications */}
<div className="fixed top-4 right-4 flex flex-col space-y-3 z-50">
  {toasts.map((toast) => (
    <div
      key={toast.id}
      className={cn(
        "px-5 py-3 min-w-[220px] rounded-lg shadow-lg flex items-center justify-between text-base font-medium transition-transform animate-slide-in",
        toast.type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      )}
    >
      <span>{toast.message}</span>
    </div>
  ))}
</div>

<style jsx>{`
  .animate-slide-in {
    transform: translateX(120%);
    animation: slide-in 0.3s forwards;
  }
  @keyframes slide-in {
    to {
      transform: translateX(0);
    }
  }
`}</style>

    </div>
  )
}
