"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MoreVertical, CheckCircle, MessageSquare, Timer, ArrowRight, Users } from "lucide-react"
import { format } from "date-fns"
import { toast } from "react-toastify"
import CommentSection from "app/components/CommentSection"

export default function MemberTaskCard({ task, mutate, onMoveTask }) {
  console.log("MemberTaskCard rendering with task:", task)

  const [menuOpen, setMenuOpen] = useState(false)
  const [timeLogOpen, setTimeLogOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [timeSpent, setTimeSpent] = useState("")
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showTimeLogs, setShowTimeLogs] = useState(false)

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("email") : null

  useEffect(() => {
    console.log("MemberTaskCard mounted with userId:", userId, "userEmail:", userEmail)
    console.log("Task time logs:", task.timeLogs)
    console.log("Task assigned to:", task.assignedTo)
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "No date"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (error) {
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
      console.log(`Updating task ${task._id} status to ${newStatus}`)

      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      if (mutate) {
        await mutate()
      }

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
    if (!timeSpent || isUpdating) {
      return
    }

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

      if (isNaN(hours)) {
        throw new Error("Invalid time format")
      }

      console.log("Logging time:", { taskId: task._id, userId, hours })

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

      const responseData = await response.json()
      console.log("Log time response:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to log time")
      }

      // Refresh tasks data
      if (mutate) {
        await mutate()
      }

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

  // Calculate total time logged - ensure we're handling the data correctly
  const totalTimeLogged = Array.isArray(task.timeLogs)
    ? task.timeLogs.reduce((acc, log) => acc + (Number(log.hours) || 0), 0)
    : 0

  console.log("Total time logged:", totalTimeLogged)

  // Check if the current user is assigned to this task
  const isAssignedToCurrentUser =
    Array.isArray(task.assignedTo) &&
    task.assignedTo.some((user) => {
      if (typeof user === "object") {
        return user.email === userEmail || user._id === userId || user.userId === userId
      }
      return user === userId
    })

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
        <div className="relative">
          <button
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className="w-full px-3 py-2 text-sm text-left bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 flex justify-between items-center"
            disabled={isUpdating}
          >
            <span>
              Status: {task.status ? task.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "To Do"}
            </span>
            <ArrowRight size={14} className={`transition-transform ${statusDropdownOpen ? "rotate-90" : ""}`} />
          </button>

          {statusDropdownOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-100 dark:border-gray-700">
              <div className="py-1">
                <button
                  onClick={() => handleStatusChange("todo")}
                  className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    task.status === "todo"
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                  disabled={isUpdating}
                >
                  To Do
                </button>
                <button
                  onClick={() => handleStatusChange("in_progress")}
                  className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    task.status === "in_progress"
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                  disabled={isUpdating}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange("done")}
                  className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    task.status === "done"
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                  disabled={isUpdating}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Logging Button - ALWAYS VISIBLE */}
      <div className="mt-4">
        <button
          onClick={() => setTimeLogOpen(!timeLogOpen)}
          className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          disabled={isUpdating}
        >
          <Timer size={16} className="mr-2" />
          {timeLogOpen ? "Cancel" : "Log Time"}
        </button>
      </div>

      {/* Time Logging Form - Shown when timeLogOpen is true */}
      {timeLogOpen && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter time spent (e.g. 2h or 30m)
            </label>
            <div className="flex">
              <input
                type="text"
                placeholder="e.g. 2h or 30m"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-1 focus:ring-green-500"
                disabled={isUpdating}
              />
              <button
                onClick={handleLogTime}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-r-md hover:bg-green-700 transition-colors"
                disabled={isUpdating || !timeSpent.trim()}
              >
                {isUpdating ? "Logging..." : "Submit"}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Format: 2h (2 hours), 30m (30 minutes), or 1.5 (1.5 hours)
            </p>
          </div>
        </div>
      )}

      {/* Time Logs Display - ALWAYS SHOW SECTION */}
      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Total time logged: {totalTimeLogged > 0 ? formatTimeDisplay(totalTimeLogged) : "No time logged yet"}
          </span>
          {totalTimeLogged > 0 && (
            <button
              onClick={() => setShowTimeLogs(!showTimeLogs)}
              className="text-xs text-green-600 dark:text-green-400 hover:underline"
            >
              {showTimeLogs ? "Hide logs" : "Show logs"}
            </button>
          )}
        </div>

        {showTimeLogs && task.timeLogs && task.timeLogs.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 p-2 rounded border text-xs">
            {task.timeLogs.map((log, index) => (
              <div key={index} className="p-1 border-b last:border-b-0 dark:border-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">{getUserDisplay(log.user || log.userId)}</span>
                  <span className="text-green-700 dark:text-green-400">{formatTimeDisplay(log.hours)}</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">{formatDateTime(log.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <Calendar size={14} className="mr-1" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
        {task.estimatedTime && (
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{task.estimatedTime}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        {/* Simplified assignment display - just show if assigned to current user */}
        <div className="flex items-center">
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
            <Users size={14} className="mr-1" />
            {isAssignedToCurrentUser ? `Assigned to you (${userEmail})` : "Not assigned to you"}
          </div>
        </div>
        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="flex items-center text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <MessageSquare size={14} className="mr-1" />
          {task.comments?.length || 0} Comments
        </button>
      </div>

      {commentsOpen && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <CommentSection taskId={task._id} userId={userId} userEmail={userEmail} mutate={mutate} />
        </div>
      )}
    </div>
  )
}
