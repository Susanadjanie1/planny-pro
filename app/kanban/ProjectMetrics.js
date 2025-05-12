'use client';

import ProjectProgressBar from './ProjectProgressBar';
import ProgressCircle from 'app/components/ProgressCircle';

export default function ProjectMetrics({ tasks = [] }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;

  const percentComplete = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-4 space-y-4">
      <h2 className="text-lg font-semibold">Project Metrics</h2>

      <div className="flex items-center gap-4">
        <ProgressCircle percentage={percentComplete} />
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div>Total Tasks: {total}</div>
          <div>To Do: {todo}</div>
          <div>In Progress: {inProgress}</div>
          <div>Done: {done}</div>
        </div>
      </div>

      <ProjectProgressBar done={done} total={total} />
    </div>
  );
}
