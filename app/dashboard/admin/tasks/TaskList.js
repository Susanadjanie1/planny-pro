"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import TaskForm from "../TaskForm"
import { fetcherWithAuth } from "lib/fetcherWithAuth"
import CommentSection from "app/components/CommentSection"
import { MessageSquare, Edit, Trash2 } from "lucide-react"

export default function TaskList({ projectId, refreshFlag, onTaskEdited }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [openComments, setOpenComments] = useState({})

  useEffect(() => {
    setLoading(true)
    const endpoint = projectId ? `/api/tasks?projectId=${projectId}` : "/api/tasks"

    fetcherWithAuth(endpoint)
      .then((data) => {
        setTasks(data)
        setLoading(false)
      })
      .catch((error) => {
        toast.error("Failed to fetch tasks")
        setLoading(false)
        console.error("Task fetch error:", error)
      })
  }, [projectId, refreshFlag])

  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        toast.success("Task deleted")
        setTasks((prev) => prev.filter((t) => t._id !== taskId))
      } else {
        const errorData = await res.json()
        toast.error(errorData.message || "Delete failed")
      }
    } catch (error) {
      toast.error("Error deleting task")
      console.error("Delete task error:", error)
    }
  }

  const handleEditClick = (task) => {
    setSelectedTask(task)
    setShowEditModal(true)
  }

  const handleTaskSaved = () => {
    setShowEditModal(false)
    setSelectedTask(null)

    const endpoint = projectId ? `/api/tasks?projectId=${projectId}` : "/api/tasks"

    setLoading(true)
    fetcherWithAuth(endpoint)
      .then((data) => {
        setTasks(data)
        setLoading(false)
        if (onTaskEdited) onTaskEdited()
      })
      .catch(() => {
        toast.error("Failed to fetch updated tasks")
        setLoading(false)
      })
  }

  const toggleComments = (taskId) => {
    setOpenComments((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold mb-4">{projectId ? "Project Tasks" : "All Tasks"}</h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No tasks found. Create a new task to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-200 transition-all"
            >
              {!projectId && task.projectName && (
                <div className="mb-2">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    {task.projectName}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start mb-1">
                <h4 className="text-lg font-semibold text-gray-800">{task.title}</h4>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    task.priority === "High"
                      ? "bg-red-100 text-green-700"
                      : task.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3 mb-3">{task.description}</p>

              {task.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-sm text-gray-500 mb-3">
                <div>Status: <span className="text-gray-700 font-medium">{task.status}</span></div>
                <div>Due: <span className="text-gray-700">{task.dueDate?.slice(0, 10) || "Not set"}</span></div>
              </div>

              {task.assignedUsers?.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  {task.assignedUsers.map((user, idx) => (
                    <div
                      key={idx}
                      className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-semibold"
                      title={user.name || user.email}
                    >
                      {user.name?.[0]?.toUpperCase() || "👤"}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-indigo-600 mb-3">
                <button
                  onClick={() => toggleComments(task._id)}
                  className="hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  {openComments[task._id] ? "Hide Comments" : "Show Comments"}
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="hover:text-blue-800 flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>

              {openComments[task._id] && (
                <div className="border-t pt-3">
                  <CommentSection taskId={task._id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <TaskForm projectId={selectedTask.projectId} selectedTask={selectedTask} onTaskSaved={handleTaskSaved} />
          </div>
        </div>
      )}
    </div>
  )
}
