"use client"

import { useEffect, useState } from "react"
import ProjectProgressBar from "./ProjectProgressBar"
import ProgressCircle from "app/components/ProgressCircle"

export default function ProjectMetrics({ tasks = [] }) {
  // Initialize metrics with zero values
  const [metrics, setMetrics] = useState({
    total: 0,
    done: 0,
    inProgress: 0,
    todo: 0,
    percentComplete: 0,
  })

  // Calculate metrics whenever tasks change
  useEffect(() => {
    if (!tasks || !Array.isArray(tasks)) return

    // Log for debugging
    console.log("ProjectMetrics: Calculating metrics from tasks:", tasks.length)
    console.log(
      "ProjectMetrics: Task statuses:",
      tasks.map((t) => ({ id: t._id, status: t.status })),
    )

    // Count tasks by status
    const total = tasks.length
    const done = tasks.filter((t) => t.status === "done").length
    const inProgress = tasks.filter((t) => t.status === "in_progress").length
    const todo = tasks.filter((t) => t.status === "todo" || !t.status).length
    const percentComplete = total > 0 ? Math.round((done / total) * 100) : 0

    // Log the calculated metrics
    console.log("ProjectMetrics: Metrics calculated:", { total, done, inProgress, todo, percentComplete })

    // Update state
    setMetrics({
      total,
      done,
      inProgress,
      todo,
      percentComplete,
    })
  }, [tasks])

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-4 space-y-4">
      <h2 className="text-lg font-semibold">Project Metrics</h2>

      <div className="flex items-center gap-4">
        <ProgressCircle percentage={metrics.percentComplete} />
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div>Total Tasks: {metrics.total}</div>
          <div>To Do: {metrics.todo}</div>
          <div>In Progress: {metrics.inProgress}</div>
          <div>Done: {metrics.done}</div>
        </div>
      </div>

      <ProjectProgressBar done={metrics.done} total={metrics.total} />
    </div>
  )
}
