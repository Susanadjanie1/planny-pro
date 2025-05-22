"use client"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState({ type: "", message: "" })
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: "", message: "" })

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.message || "Something went wrong",
        })
      } else {
        setStatus({
          type: "success",
          message: "If an account with that email exists, we've sent password reset instructions.",
        })
        setEmail("")
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: "#4B0082" }}>
            Forgot Password
          </h1>
          <p className="mt-2 text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {status.message && (
          <div
            className={`p-3 text-sm rounded-md ${
              status.type === "error" ? "text-red-800 bg-red-100" : "text-green-800 bg-green-100"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{
                focusRing: "#4B0082",
                focusBorderColor: "#4B0082",
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white font-medium rounded-md shadow transition duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "#4B0082",
              hover: { backgroundColor: "#3A0068" },
              focusRing: "#FFD700",
              focusRingOffset: "2px",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="mt-4 text-sm text-gray-600">
            <a
              href="/auth/login"
              className="font-medium"
              style={{
                color: "#4B0082",
                hover: { color: "#FFD700" },
              }}
            >
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
