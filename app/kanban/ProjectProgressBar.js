// app/kanban/ProjectProgressBar.js
'use client';

export default function ProjectProgressBar({ done, total }) {
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mt-3">
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className="bg-[#4B0082] h-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-1">{percent}% Complete</p>
    </div>
  );
}
