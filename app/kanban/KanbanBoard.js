"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"
import TaskColumn from "./TaskColumn"

const backgroundOptions = [
  { id: "gradient1", name: "Purple Gradient", value: "bg-gradient-to-r from-[#4B0082]/90 to-purple-600/90" },
  { id: "gradient2", name: "Gold Luxury", value: "bg-gradient-to-r from-[#FFD700]/90 to-amber-600/90" },
  { id: "solid", name: "Solid Indigo", value: "bg-[#4B0082]/90" },
  { id: "pattern", name: "Subtle Pattern", value: "bg-[url('/patterns/subtle-pattern.png')] bg-repeat bg-[#4B0082]/90" },
]

export default function KanbanBoard({ tasks = [], mutate, isLoading = false, error = null, userRole = "manager" }) {
  const [columns, setColumns] = useState({
    todo: { title: "To Do", items: [] },
    in_progress: { title: "In Progress", items: [] },
    done: { title: "Done", items: [] },
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [background, setBackground] = useState(backgroundOptions[0].value)
  const [taskUpdating, setTaskUpdating] = useState(false)
  const [movingTaskId, setMovingTaskId] = useState(null)

  // Updates task status by calling API & triggering mutate()
  const updateTaskStatus = useCallback(
    async (taskId, newStatus) => {
      if (taskUpdating && movingTaskId === taskId) return false

      setTaskUpdating(true)
      setMovingTaskId(taskId)

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
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to update task status")
        }

        await new Promise((r) => setTimeout(r, 300))

        if (mutate) await mutate()
        return true
      } catch (err) {
        toast.error(`Error: ${err.message}`)
        return false
      } finally {
        setTaskUpdating(false)
        setMovingTaskId(null)
      }
    },
    [mutate, taskUpdating, movingTaskId],
  )

  // Organize tasks by status & filter by search term
  useEffect(() => {
    if (!Array.isArray(tasks)) return

    const filtered = tasks.filter(
      (t) =>
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    const newColumns = {
      todo: { title: "To Do", items: [] },
      in_progress: { title: "In Progress", items: [] },
      done: { title: "Done", items: [] },
    }

    filtered.forEach((task) => {
      let status = task.status?.toLowerCase().replace(/\s+/g, "_") || "todo"
      if (status === "not_started") status = "todo"
      if (status === "completed") status = "done"
      if (!newColumns[status]) status = "todo"
      newColumns[status].items.push(task)
    })

    setColumns(newColumns)
  }, [tasks, searchTerm])

  // Handle moving a task to a new status (column)
  const handleMoveTask = async (taskId, newStatus) => {
    if (taskUpdating) return false

    let currentColumn = null
    let task = null

    for (const [colId, col] of Object.entries(columns)) {
      const found = col.items.find((t) => t._id === taskId)
      if (found) {
        currentColumn = colId
        task = found
        break
      }
    }

    if (!task || currentColumn === newStatus) return false

    return await updateTaskStatus(taskId, newStatus)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4B0082]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Tasks</h3>
        <p>{error.message || "Something went wrong. Please try again later."}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#4B0082]">Task Board</h2>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#4B0082]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B0082]"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          >
            {backgroundOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`rounded-lg p-6 ${background}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <TaskColumn
              key={columnId}
              id={columnId}
              title={column.title}
              tasks={column.items}
              mutate={mutate}
              userRole={userRole}
              onMoveTask={handleMoveTask}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
