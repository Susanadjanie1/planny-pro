"use client"

import { useState } from "react"
import { Calendar, Clock, MoreVertical, CheckCircle, Timer, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { toast } from "react-toastify"
import CommentSection from "app/components/CommentSection"

export default function MemberTaskCard({ task, mutate, onMoveTask }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [timeLogOpen, setTimeLogOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [timeSpent, setTimeSpent] = useState("")
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showTimeLogs, setShowTimeLogs] = useState(false)

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("email") : null

  const formatDate = (dateString) => {
    if (!dateString) return "No date"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      if (mutate) await mutate()

      toast?.success?.("Status updated")
    } catch (error) {
      console.error("Error updating status:", error)
      toast?.error?.(`Error: ${error.message}`)
    } finally {
      setIsUpdating(false)
      setStatusDropdownOpen(false)
      setMenuOpen(false)
    }
  }

  const handleLogTime = async () => {
    if (!timeSpent || isUpdating) return

    // Support both formats: hours (2h) and minutes (30m)
    const timeRegex = /^\d+(\.\d+)?[hm]?$/
    if (!timeRegex.test(timeSpent)) {
      toast?.error?.("Please use format like '2h', '30m', or just a number for hours")
      return
    }

    setIsUpdating(true)
    try {
      const token = localStorage.getItem("token")

      // Parse the time input
      let hours
      if (timeSpent.endsWith("h")) {
        hours = Number.parseFloat(timeSpent.slice(0, -1))
      } else if (timeSpent.endsWith("m")) {
        hours = Number.parseFloat(timeSpent.slice(0, -1)) / 60
      } else {
        hours = Number.parseFloat(timeSpent)
      }

      if (isNaN(hours)) throw new Error("Invalid time format")

      console.log("Logging time:", { taskId: task._id, userId, hours })

      // Note: Using [id] instead of [taskId] in the API route path
      const response = await fetch(`/api/tasks/${task._id}/logtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          hours: hours,
        }),
      })

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        let errorMessage = "Failed to log time"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Log time response:", data)

      // Refresh tasks data
      if (mutate) await mutate()

      setTimeLogOpen(false)
      setTimeSpent("")
      setShowTimeLogs(true)
      toast?.success?.("Time logged successfully")
    } catch (error) {
      console.error("Error logging time:", error)
      toast?.error?.(`Error: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  function formatTimeDisplay(hours) {
    if (hours >= 1) {
      const h = Math.floor(hours)
      const m = Math.round((hours - h) * 60)
      return m > 0 ? `${h}h ${m}m` : `${h}h`
    }
    return `${Math.round(hours * 60)}m`
  }

  function formatDateTime(date) {
    return new Date(date).toLocaleString()
  }

  function getUserDisplay(user) {
    if (!user) return "Unknown"
    if (typeof user === "object") {
      return user.email || user.name || "Unknown User"
    }
    return user
  }

  const totalTimeLogged = (task.timeLogs || []).reduce((acc, log) => acc + (log.hours || 0), 0)

  // Check if the current user is assigned to this task
  const isAssignedToCurrentUser = task.assignedTo?.some(
    (user) => user.email === userEmail || user._id === userId || user.userId === userId,
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isUpdating}
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-100 dark:border-gray-700">
              <div className="py-1">
                <button
                  onClick={() => handleStatusChange("todo")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isUpdating}
                >
                  <ArrowRight size={14} className="mr-2" />
                  Move to To Do
                </button>

                <button
                  onClick={() => handleStatusChange("in_progress")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isUpdating}
                >
                  <ArrowRight size={14} className="mr-2" />
                  Move to In Progress
                </button>

                <button
                  onClick={() => handleStatusChange("done")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isUpdating}
                >
                  <CheckCircle size={14} className="mr-2" />
                  Move to Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {/* Priority display (read-only) */}
        {task.priority && (
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span>
        )}
        {task.tags?.map((tag, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Status Dropdown */}
      <div className="mt-3">
        <button
          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:underline"
          disabled={isUpdating}
        >
          Status: <span className="capitalize">{task.status || "todo"}</span>
        </button>

        {statusDropdownOpen && (
          <div className="mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md z-20 absolute">
            {["todo", "in_progress", "done"].map((statusOption) => (
              <button
                key={statusOption}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  task.status === statusOption ? "font-bold" : ""
                }`}
                onClick={() => handleStatusChange(statusOption)}
                disabled={isUpdating}
              >
                {statusOption.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <Calendar size={14} />
          <span>Due: {formatDate(task.dueDate)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock size={14} />
          <span>Created: {formatDate(task.createdAt)}</span>
        </div>
      </div>

      {/* Assigned users display */}
      <div className="mt-3 text-sm">
        <strong>Assigned to:</strong>{" "}
        {task.assignedTo && task.assignedTo.length > 0
          ? task.assignedTo.map((user) => getUserDisplay(user)).join(", ")
          : "Unassigned"}
      </div>

      {/* Time logged display */}
      <div className="mt-3 flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Timer size={16} />
          <span>{formatTimeDisplay(totalTimeLogged)}</span>
        </div>
        <button
          onClick={() => setTimeLogOpen(!timeLogOpen)}
          className="text-blue-600 hover:underline text-sm"
          disabled={isUpdating}
        >
          {timeLogOpen ? "Cancel" : "Log Time"}
        </button>
        <button
          onClick={() => setShowTimeLogs(!showTimeLogs)}
          className="text-blue-600 hover:underline text-sm"
          disabled={isUpdating}
        >
          {showTimeLogs ? "Hide Logs" : "Show Logs"}
        </button>
      </div>

      {/* Time log input */}
      {timeLogOpen && (
        <div className="mt-2 flex items-center space-x-2">
          <input
            type="text"
            placeholder="e.g. 2h or 30m"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
            className="flex-1 border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
            disabled={isUpdating}
          />
          <button
            onClick={handleLogTime}
            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={isUpdating || !timeSpent}
          >
            Log
          </button>
        </div>
      )}

      {/* Time logs list */}
      {showTimeLogs && task.timeLogs && task.timeLogs.length > 0 && (
        <div className="mt-3 text-xs max-h-48 overflow-auto border-t border-gray-200 dark:border-gray-700 pt-2">
          {task.timeLogs.map((log) => (
            <div key={log._id || log.id} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
              <div>{getUserDisplay(log.user)} logged {formatTimeDisplay(log.hours)}</div>
              <div className="text-gray-400 dark:text-gray-500">{formatDateTime(log.date)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Comments section */}
      <div className="mt-3">
        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="text-blue-600 hover:underline text-sm"
        >
          {commentsOpen ? "Hide Comments" : `Comments (${task.comments ? task.comments.length : 0})`}
        </button>

        {commentsOpen && <CommentSection taskId={task._id} comments={task.comments} mutate={mutate} />}
      </div>
    </div>
  )
}
