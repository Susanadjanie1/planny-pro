"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ProjectEditModal from "../ProjectEditModal"
import { FiEdit, FiTrash2 } from "react-icons/fi"

export default function ProjectList({ refreshFlag, onProjectSelect }) {
  const [projects, setProjects] = useState([])
  const [editingProject, setEditingProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const res = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()

        // Handle both the new format { projects: [] } and the old format []
        if (data.projects && Array.isArray(data.projects)) {
          setProjects(data.projects)
        } else if (Array.isArray(data)) {
          setProjects(data)
        } else {
          console.log("Unexpected API response format:", data)
          setProjects([]) // Set empty array instead of throwing error
        }
      } catch (error) {
        console.error("Project fetch error:", error)
        toast.error("Failed to load projects")
        setProjects([]) // Ensure we have a valid state even on error
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [refreshFlag])

  const deleteProject = (id) => {
    const toastId = toast.info(
      <div className="space-y-3">
        <p className="font-semibold text-sm">Confirm delete this project?</p>
        <div className="flex justify-end gap-3">
          <button
            className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => toast.dismiss(toastId)}
          >
            Cancel
          </button>
          <button
            className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
            onClick={async () => {
              toast.dismiss(toastId)
              try {
                const token = localStorage.getItem("token")
                const res = await fetch(`/api/projects/${id}`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
                if (res.ok) {
                  setProjects((prev) => prev.filter((p) => p._id !== id))
                  toast.success("Project deleted")
                } else throw new Error("Delete failed")
              } catch (error) {
                toast.error(error.message)
              }
            }}
          >
            Yes, delete
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false },
    )
  }

  const handleUpdate = (updatedProject) => {
    setProjects(projects.map((p) => (p._id === updatedProject._id ? updatedProject : p)))
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-[#4B0082]">All Projects</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4B0082]"></div>
        </div>
      ) : projects.length === 0 ? (
        <p>No projects found. Create your first project to get started!</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => onProjectSelect?.(project._id)}
              className="bg-white rounded-2xl shadow-md p-5 border border-gray-200  hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="font-bold text-lg text-gray-800">{project.title}</h3>
              <p className="text-gray-600 mt-1">{project.description}</p>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingProject(project)
                  }}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >Edit <FiEdit />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteProject(project._id)
                  }}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >Delete <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectEditModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onUpdated={handleUpdate}
      />
    </div>
  )
}
