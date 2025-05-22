"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Download, FilePlus, ListTodo, PlusCircle } from "lucide-react"
import Sidebar from "app/components/Sidebar"
import ProjectForm from "./ProjectForm"
import ProjectList from "./projects/ProjectList"
import TaskForm from "./TaskForm"
import TaskList from "./tasks/TaskList"
import SearchBar from "app/components/SearchBar"

export default function DashboardPage({ session }) {
  const [refreshFlag, setRefreshFlag] = useState(0)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [activeView, setActiveView] = useState("dashboard")

  const displayName = session?.email || "Admin"

  const handleExport = async (projectId) => {
    const res = await fetch(`/api/reports/${projectId}`)
    if (!res.ok) {
      toast.error("Report generation failed")
      return
    }
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `project-${projectId}-report.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Project report downloaded")
  }

  useEffect(() => {
    if (selectedProjectId) {
      setActiveView("tasks")
    }
  }, [selectedProjectId])

  const handleSearchResultSelect = (type, id) => {
    if (type === "project") {
      setSelectedProjectId(id)
      setActiveView("tasks")
    } else if (type === "task") {
      // Instead of fetching the task details, just navigate to the all tasks view
      // and let the user find the task in the list
      setActiveView("allTasks")

      // Optionally, you could set a state to highlight this task in the list
      // or scroll to it, but that would require additional changes to TaskList

      // If you really need to navigate to the specific project containing this task,
      // you could modify the tasks/search endpoint to include the projectId in the
      // search results, then use that directly instead of making another API call
    }
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "#4B0082" }}>
              Quick Actions
            </h2>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="space-y-3">
                <button
                  onClick={() => setActiveView("createProject")}
                  className="w-full py-3 px-4 bg-indigo-100 hover:bg-indigo-200 text-[#4B0082] rounded-lg flex items-center"
                >
                  <FilePlus className="h-5 w-5 mr-3" />
                  Create New Project
                </button>

                <button
                  onClick={() => setActiveView("projects")}
                  className="w-full py-3 px-4 bg-indigo-100 hover:bg-indigo-200 text-[#4B0082] rounded-lg flex items-center"
                >
                  <ListTodo className="h-5 w-5 mr-3" />
                  View All Projects
                </button>

                <button
                  onClick={() => setActiveView("createTask")}
                  className="w-full py-3 px-4 bg-indigo-100 hover:bg-indigo-200 text-[#4B0082] rounded-lg flex items-center"
                >
                  <PlusCircle className="h-5 w-5 mr-3" />
                  Create New Task
                </button>

                <button
                  onClick={() => setActiveView("allTasks")}
                  className="w-full py-3 px-4 bg-indigo-100 hover:bg-indigo-200 text-[#4B0082] rounded-lg flex items-center"
                >
                  <ListTodo className="h-5 w-5 mr-3" />
                  View All Tasks
                </button>

                {selectedProjectId && (
                  <button
                    onClick={() => setActiveView("tasks")}
                    className="w-full py-3 px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg flex items-center"
                  >
                    <ListTodo className="h-5 w-5 mr-3" />
                    Manage Selected Project
                  </button>
                )}
              </div>
            </div>
          </div>
        )

      case "createProject":
        return (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#4B0082" }}>
              Create New Project
            </h2>
            <ProjectForm
              onProjectCreated={() => {
                setRefreshFlag((prev) => prev + 1)
                toast.success("Project created successfully")
                setActiveView("projects")
              }}
            />
          </div>
        )

      case "projects":
        return (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#4B0082" }}>
              {/* Your Projects */}
            </h2>
            <ProjectList
              refreshFlag={refreshFlag}
              onProjectSelect={(id) => {
                setSelectedProjectId(id)
                setActiveView("tasks")
              }}
            />
            <div className="mb-4 flex justify-end"></div>
          </div>
        )

      case "createTask":
        return (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#4B0082" }}>
              Create New Task
            </h2>
            <TaskForm
              projectId={selectedProjectId}
              onTaskSaved={() => {
                setRefreshFlag((prev) => prev + 1)
                // toast.success("Task created successfully")
                setActiveView("allTasks")
              }}
            />
          </div>
        )

      case "allTasks":
        return (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold" style={{ color: "#4B0082" }}></h2>
            </div>

            <TaskList
              refreshFlag={refreshFlag}
              onEditTask={(task) => {
                setTaskToEdit(task)
                setActiveView("createTask")
              }}
            />
          </div>
        )

      case "tasks":
        return selectedProjectId ? (
          <div className="bg-white p-6 rounded-2xl shadow-md space-y-6 border border-gray-100">
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleExport(selectedProjectId)}
                className="flex items-center px-4 py-2 bg-[#4B0082] hover:bg-indigo-700 text-white rounded-lg "
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>

            <TaskList projectId={selectedProjectId} refreshFlag={refreshFlag} onEditTask={setTaskToEdit} />

            <div className="pt-4">
              <button
                onClick={() => {
                  setSelectedProjectId(null)
                  setActiveView("projects")
                }}
                className="text-[#4B0082] hover:text-indigo-800"
              >
                ← Back to Projects
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-2xl shadow-md border border-gray-100">
            <p className="text-gray-600 text-lg">No project selected. Please select a project first.</p>
            <button
              onClick={() => setActiveView("projects")}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              View Projects
            </button>
          </div>
        )

      default:
        return (
          <div className="text-center p-10 bg-white rounded-2xl shadow-md border border-gray-100">
            <p className="text-gray-600 text-lg">Select an option from the sidebar</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Sidebar Component */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        displayName={displayName}
        selectedProjectId={selectedProjectId}
      />

      {/* Main Content */}
      <div className="min-h-screen p-6 sm:p-10 lg:ml-64 pt-10">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold" style={{ color: "#4B0082" }}>
                Admin Dashboard
              </h1>
              <p className="text-gray-500 mt-1">Welcome back, {displayName}</p>
            </div>

            {/* Global Search Bar */}
            <SearchBar onResultSelect={handleSearchResultSelect} className="w-full md:w-96" />
          </div>
        </div>

        {renderActiveView()}
      </div>
    </div>
  )
}
