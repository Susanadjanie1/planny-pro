"use client";

import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";

export default function TaskColumn({
  id,
  title,
  tasks,
  mutate,
  userRole,
  onMoveTask,
}) {
  const formatStatusName = (status) =>
    status
      ?.split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Unknown Status";

  const displayTitle = title || formatStatusName(id);

  const canAddTask = userRole === "admin" || userRole === "manager";

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-semibold text-white mb-3 flex items-center justify-between">
        <span className="flex items-center">
          {displayTitle}
          <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </span>
      </h3>

      <div className="flex-1 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task._id} className="mb-3">
              <TaskCard
                task={task}
                mutate={mutate}
                userRole={userRole}
                columnId={id}
                onMoveTask={onMoveTask}
              />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 bg-white/10 rounded-md text-white/70 text-sm">
            <p>No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
