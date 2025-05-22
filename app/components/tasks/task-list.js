"use client"

import { useState, useEffect } from "react"
import MemberTaskCard from "./member-task-card"
import { toast } from "react-toastify"

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // This is the URL to fetch tasks assigned to the current user
      const response = await fetch("/api/tasks/assigned", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }

      const data = await response.json()
      console.log("Fetched tasks:", data)
      setTasks(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError(err.message)
      toast?.error?.(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task status")
      }

      await fetchTasks() // Refresh tasks after update
      toast?.success?.("Task moved successfully")
      return true
    } catch (error) {
      console.error("Error moving task:", error)
      toast?.error?.(`Error: ${error.message}`)
      return false
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Loading tasks...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>
  }

  if (tasks.length === 0) {
    return <div className="p-4 text-center">No tasks assigned to you</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {tasks.map((task) => (
        <MemberTaskCard key={task._id} task={task} mutate={fetchTasks} onMoveTask={handleMoveTask} />
      ))}
    </div>
  )
}
