'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { jwtDecode } from 'jwt-decode';
import TaskColumn from './TaskColumn';
import { fetcherWithAuth } from 'lib/fetcherWithAuth';

const STATUSES = ['todo', 'in_progress', 'done'];

export default function KanbanBoard({ userId, tasks: propTasks, mutate: propMutate }) {
  const [userRole, setUserRole] = useState(null);

  // Only fetch tasks if they weren't passed as props
  const {
    data: fetchedTasks,
    error,
    mutate: fetchMutate,
  } = useSWR(propTasks ? null : '/api/tasks', fetcherWithAuth);

  // Extract tasks array from the response if needed
  const rawTasks = propTasks || (fetchedTasks?.tasks || fetchedTasks);
  const tasks = Array.isArray(rawTasks) ? rawTasks : [];
  const mutate = propMutate || fetchMutate;

  console.log('KanbanBoard data:', {
    userId,
    tasksLength: tasks.length,
    firstTask: tasks[0], // Show sample of first task for debugging
  });

  // Get user role from token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded?.role || 'guest');
      } catch (err) {
        console.error('Failed to decode JWT:', err);
        setUserRole('guest');
      }
    }
  }, []);

  if (error) {
    console.error('Error loading tasks:', error);
    return <div className="p-4 text-red-500">Failed to load tasks</div>;
  }

  // Filter tasks for the specific user if userId is provided
  const filteredTasks = userId
    ? tasks.filter(task => {
        if (!task.assignedTo) return false;
        
        return task.assignedTo.some(user => {
          // Check if user is an object with _id or id
          if (typeof user === 'object') {
            return user._id === userId || user.id === userId;
          }
          // Check if user is a string ID
          return user === userId;
        });
      })
    : tasks;

  console.log('Filtered tasks by status:', {
    todo: filteredTasks.filter(task => task.status === 'todo').length,
    in_progress: filteredTasks.filter(task => task.status === 'in_progress').length,
    done: filteredTasks.filter(task => task.status === 'done').length,
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Kanban Board</h2>
      {tasks.length === 0 ? (
        <div className="bg-yellow-100 p-4 rounded">
          <p className="text-yellow-800">No tasks available. Either no tasks exist or your API may not be returning data correctly.</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-blue-100 p-4 rounded">
          <p className="text-blue-800">No tasks assigned to you. Check if your user ID ({userId}) matches what's in the task assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={filteredTasks.filter(task => task.status === status)}
              mutate={mutate}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}