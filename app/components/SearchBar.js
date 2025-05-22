"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { useDebounce } from "../hooks/useDebounce"

export default function SearchBar({ onResultSelect, className = "" }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const searchRef = useRef(null)

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Search when query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    const performSearch = async () => {
      setIsLoading(true)
      try {
        // Fetch projects and tasks separately with error handling for each
        let projectResults = []
        let taskResults = []

        try {
          const projectsRes = await fetch(`/api/projects/search?q=${encodeURIComponent(debouncedQuery)}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })

          if (projectsRes.ok) {
            const projectsData = await projectsRes.json()
            // Format projects as search results
            projectResults = (projectsData?.projects || []).map((project) => ({
              id: project._id,
              title: project.title,
              type: "project",
              description: project.description,
            }))
          }
        } catch (projectError) {
          console.error("Project search error:", projectError)
        }

        try {
          const tasksRes = await fetch(`/api/tasks/search?q=${encodeURIComponent(debouncedQuery)}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })

          if (tasksRes.ok) {
            const tasksData = await tasksRes.json()
            // Format tasks as search results
            taskResults = (tasksData?.tasks || []).map((task) => ({
              id: task._id,
              title: task.title,
              type: "task",
              description: task.description,
              status: task.status,
              priority: task.priority,
              projectName: task.projectName,
            }))
          }
        } catch (taskError) {
          console.error("Task search error:", taskError)
        }

        // Combine and limit results
        setResults([...projectResults, ...taskResults].slice(0, 10))
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    setIsOpen(true)
  }

  const handleClearSearch = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  const handleResultClick = (result) => {
    onResultSelect(result.type, result.id)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="search"
          className="block w-full p-2.5 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search projects and tasks..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setIsOpen(true)}
        />
        {query && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={handleClearSearch}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {isOpen && query.trim() !== "" && (results.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-96 overflow-y-auto border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          ) : (
            <ul className="py-1">
              {results.length === 0 ? (
                <li className="px-4 py-2 text-sm text-gray-500">No results found</li>
              ) : (
                <>
                  {/* Group by type */}
                  {results.some((r) => r.type === "project") && (
                    <li className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">Projects</li>
                  )}
                  {results
                    .filter((r) => r.type === "project")
                    .map((result) => (
                      <li
                        key={`project-${result.id}`}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-center">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                            {result.description && (
                              <p className="text-xs text-gray-500 truncate">{result.description}</p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}

                  {results.some((r) => r.type === "task") && (
                    <li className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">Tasks</li>
                  )}
                  {results
                    .filter((r) => r.type === "task")
                    .map((result) => (
                      <li
                        key={`task-${result.id}`}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-center">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                              {result.projectName && (
                                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full mr-2">
                                  {result.projectName}
                                </span>
                              )}
                              {result.status && <span className="mr-2">{result.status}</span>}
                              {result.priority && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${
                                    result.priority?.toString().toLowerCase().includes("high")
                                      ? "bg-red-100 text-red-800"
                                      : result.priority?.toString().toLowerCase().includes("medium")
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {result.priority}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                </>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
