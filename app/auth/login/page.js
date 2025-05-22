"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      // Decode payload from JWT (without verifying)
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      const role = payload?.role;

      // Redirect based on role
      if (role === "admin") window.location.href = "/dashboard/admin";
      else if (role === "manager") window.location.href = "/dashboard/manager";
      else if (role === "member") window.location.href = "/dashboard/member";
      else window.location.href = "/unauthorized";
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: "#4B0082" }}>
            Sign In
          </h1>
          <p className="mt-2 text-gray-600">Welcome back</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
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
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="w-4 h-4 border-gray-300 rounded"
                style={{ accentColor: "#4B0082" }}
              />
              <label
                htmlFor="remember-me"
                className="block ml-2 text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <a
              href="/auth/forgot-password"
              className="text-sm font-medium"
              style={{ color: "#4B0082", hover: { color: "#FFD700" } }}
            >
              Forgot password?
            </a>
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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center pt-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">or</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            <p>Don&apos;t have an account?</p>{" "}
            <a
              href="/auth/signup"
              className="font-medium"
              style={{
                color: "#4B0082",
                hover: { color: "#FFD700" },
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
