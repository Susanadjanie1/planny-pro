"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage({ params }) {
  const { token } = params
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState({ type: "", message: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(null)

  // Verify token on page load
  useEffect(() => {
    async function verifyToken() {
      try {
        const res = await fetch(`/api/auth/verify-reset-token?token=${token}`)
        const data = await res.json()

        if (!res.ok) {
          setIsTokenValid(false)
          setStatus({
            type: "error",
            message: data.message || "Invalid or expired token",
          })
        } else {
          setIsTokenValid(true)
        }
      } catch (err) {
        setIsTokenValid(false)
        setStatus({
          type: "error",
          message: "An error occurred while verifying the token",
        })
      }
    }

    verifyToken()
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()

    if (password !== confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match",
      })
      return
    }

    setIsLoading(true)
    setStatus({ type: "", message: "" })

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
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
          message: "Password has been reset successfully",
        })

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
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

  // Show loading state while verifying token
  if (isTokenValid === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="text-center">
            <p className="text-gray-600">Verifying reset token...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if token is invalid
  if (isTokenValid === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="text-center">
            <h1 className="text-3xl font-bold" style={{ color: "#4B0082" }}>
              Invalid Link
            </h1>
            <p className="mt-2 text-gray-600">This password reset link is invalid or has expired.</p>
            <div className="mt-6">
              <a
                href="/auth/forgot-password"
                className="px-4 py-2 text-white font-medium rounded-md shadow transition duration-200"
                style={{
                  backgroundColor: "#4B0082",
                  display: "inline-block",
                }}
              >
                Request New Link
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: "#4B0082" }}>
            Reset Password
          </h1>
          <p className="mt-2 text-gray-600">Enter your new password below</p>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{
                focusRing: "#4B0082",
                focusBorderColor: "#4B0082",
              }}
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{
                focusRing: "#4B0082",
                focusBorderColor: "#4B0082",
              }}
              required
              minLength={8}
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
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
