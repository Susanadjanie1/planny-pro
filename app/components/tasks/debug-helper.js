"use client"
import { useState, useEffect } from "react"
import MemberTaskCard from "../../kanban/MemberTaskCard"

export default function DebugHelper() {
  const [userId, setUserId] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Get user info from localStorage
    const storedUserId = localStorage.getItem("userId")
    const storedEmail = localStorage.getItem("email")

    setUserId(storedUserId || "test-user-id")
    setUserEmail(storedEmail || "test@example.com")

    // If no user info in localStorage, set some test values
    if (!storedUserId) localStorage.setItem("userId", "test-user-id")
    if (!storedEmail) localStorage.setItem("email", "test@example.com")
  }, [])

  // Mock task data for testing
  const mockTask = {
    _id: "mock-task-123",
    title: "Debug Task Card",
    description: "This is a mock task to debug the MemberTaskCard component",
    status: "in_progress",
    priority: "medium",
    dueDate: new Date().toISOString(),
    estimatedTime: "2h",
    tags: ["debug", "test"],
    assignedTo: [{ _id: userId, email: userEmail }],
    timeLogs: [
      {
        _id: "log-1",
        userId: userId,
        hours: 1.5,
        createdAt: new Date().toISOString(),
      },
      {
        _id: "log-2",
        userId: userId,
        hours: 0.5,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      },
    ],
    comments: [],
  }

  const mockMutate = () => {
    console.log("Mock mutate called")
    return Promise.resolve()
  }

  const mockMoveTask = (taskId, status) => {
    console.log(`Mock move task ${taskId} to ${status}`)
    return Promise.resolve(true)
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md">
        <h2 className="font-bold text-yellow-800">Debug Mode</h2>
        <p className="text-sm text-yellow-700">
          This is a debug component with mock data to test the MemberTaskCard component.
        </p>
        <p className="text-sm text-yellow-700 mt-2">
          User ID: {userId}
          <br />
          Email: {userEmail}
        </p>
      </div>

      <MemberTaskCard task={mockTask} mutate={mockMutate} onMoveTask={mockMoveTask} />
    </div>
  )
}
