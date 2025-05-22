"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  MessageSquare,
  Users,
  ArrowRight,
  Flag,
} from "lucide-react"
import { format } from "date-fns"
import CommentSection from "app/components/CommentSection"

export default function ManagerTaskCard({ task, mutate, onMoveTask, isAdmin = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Get current user ID
  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (userId) {
      setCurrentUserId(userId)
    }
  }, [])

  // Fetch available users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("Available users for assignment:", data.users)

          // Filter out current user if they're a manager
          const filteredUsers = data.users.filter((user) => {
            // If admin, show all users
            if (isAdmin) return true
            // If manager, don't show self in the list and only show members
            return user._id !== currentUserId && user.role === "member"
          })

          setAvailableUsers(filteredUsers || [])
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    if (currentUserId) {
      fetchUsers()
    }
  }, [currentUserId, isAdmin])

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

  const handleDelete = async () => {
    if (!isAdmin) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      // Refresh tasks
      if (mutate) {
        await mutate()
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }

    setMenuOpen(false)
  }

  const handleEdit = () => {
    // Implementation for edit functionality
    setMenuOpen(false)
  }

  const handleComplete = async () => {
    if (onMoveTask && !isUpdating) {
      setIsUpdating(true)
      await onMoveTask(task._id, "done")
      setIsUpdating(false)
    }
    setMenuOpen(false)
  }

  const handleAssign = async (email) => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${task._id}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedTo: [email] }),
      })

      if (!response.ok) {
        throw new Error("Failed to assign task")
      }

      // Refresh tasks data
      if (mutate) {
        await mutate()
      }
      setAssignDropdownOpen(false)
    } catch (error) {
      console.error("Error assigning task:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Update the handleMoveTask function to prevent task duplication
  const handleMoveTaskTo = async (status) => {
    if (onMoveTask && !isUpdating) {
      setIsUpdating(true)
      const success = await onMoveTask(task._id, status)
      setIsUpdating(false)

      if (success) {
        setStatusDropdownOpen(false)
        setMenuOpen(false)
      }
    }
  }

  // Ensure the priority dropdown works correctly
  const handleChangePriority = async (priority) => {
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
        body: JSON.stringify({ priority }),
      })

      if (!response.ok) {
        throw new Error("Failed to update priority")
      }

      // Refresh tasks data
      if (mutate) {
        await mutate()
      }
      setPriorityDropdownOpen(false)
    } catch (error) {
      console.error("Error updating priority:", error)
    } finally {
      setIsUpdating(false)
    }
  }

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
                  onClick={handleEdit}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isUpdating}
                >
                  <Edit size={14} className="mr-2" />
                  Edit Task
                </button>

                <button
                  onClick={() => handleMoveTaskTo("todo")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isUpdating}
                >
                  <ArrowRight size={14} className="mr-2" />
                  Move to To Do
                </button>

                <button
                  onClick={() => handleMoveTaskTo("in_progress")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isUpdating}
                >
                  <ArrowRight size={14} className="mr-2" />
                  Move to In Progress
                </button>

                <button
                  onClick={() => handleMoveTaskTo("done")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isUpdating}
                >
                  <CheckCircle size={14} className="mr-2" />
                  Move to Done
                </button>

                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={isUpdating}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="relative">
          <button
            onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
            className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)} hover:opacity-80`}
            disabled={isUpdating}
          >
            {task.priority || "No Priority"}
          </button>

          {priorityDropdownOpen && (
            <div className="absolute left-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-100 dark:border-gray-700">
              <div className="py-1">
                <button
                  onClick={() => handleChangePriority("high")}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isUpdating}
                >
                  <Flag size={14} className="mr-2" />
                  High
                </button>
                <button
                  onClick={() => handleChangePriority("medium")}
                  className="flex items-center w-full px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isUpdating}
                >
                  <Flag size={14} className="mr-2" />
                  Medium
                </button>
                <button
                  onClick={() => handleChangePriority("low")}
                  className="flex items-center w-full px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isUpdating}
                >
                  <Flag size={14} className="mr-2" />
                  Low
                </button>
              </div>
            </div>
          )}
        </div>

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
                  onClick={() => handleMoveTaskTo("todo")}
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
                  onClick={() => handleMoveTaskTo("in_progress")}
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
                  onClick={() => handleMoveTaskTo("done")}
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
        <div className="flex items-center">
          <div className="relative">
            <button
              onClick={() => setAssignDropdownOpen(!assignDropdownOpen)}
              className="flex items-center text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              disabled={isUpdating}
            >
              <Users size={14} className="mr-1" />
              {task.assignedTo?.length > 0 && task.assignedTo[0]?.email
                ? task.assignedTo[0].email
                : task.assignedTo?.length > 0 && task.assignedTo[0]?.name
                  ? task.assignedTo[0].name
                  : "Assign"}
            </button>
            {assignDropdownOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-100 dark:border-gray-700 max-h-40 overflow-y-auto">
                <div className="py-1">
                  {availableUsers.length > 0 ? (
                    availableUsers.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleAssign(user.email)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={isUpdating}
                      >
                        {user.email} {user.role && `(${user.role})`}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No users available</div>
                  )}
                </div>
              </div>
            )}
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
          <CommentSection taskId={task._id} mutate={mutate} />
        </div>
      )}
    </div>
  )
}
