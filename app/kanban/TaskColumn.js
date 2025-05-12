'use client';

import TaskCard from './TaskCard';
import ManagerTaskCard from './ManagerTaskCard';
import MemberTaskCard from './MemberTaskCard';

export default function TaskColumn({ status, tasks, mutate, userRole }) {
  const formatStatusName = (status) =>
    status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const renderCard = (task) => {
    if (userRole === 'manager') {
      return <ManagerTaskCard key={task._id} task={task} mutate={mutate} />;
    }
    if (userRole === 'member') {
      return <MemberTaskCard key={task._id} task={task} mutate={mutate} />;
    }
    return <TaskCard key={task._id} task={task} mutate={mutate} userRole={userRole} />;
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl shadow-md min-w-[260px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-[#4B0082] dark:text-indigo-300 capitalize">
          {formatStatusName(status)}
        </h3>
        <span className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-4">
        {tasks.map((task) => renderCard(task))}
      </div>
    </div>
  );
}
