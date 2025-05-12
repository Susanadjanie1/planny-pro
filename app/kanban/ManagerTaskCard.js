"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CommentSection from "app/components/CommentSection";

export default function ManagerTaskCard({ task, mutate }) {
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo?.[0]?._id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Fetch users for assignment dropdown
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
        toast.error("Could not load team members");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Update task status
  async function handleStatusChange(e) {
    try {
      const newStatus = e.target.value;
      setStatus(newStatus);
      
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      mutate();
      toast.success("Status updated");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      // Revert state on error
      setStatus(task.status);
    }
  }

  // Update task priority
  async function handlePriorityChange(e) {
    try {
      const newPriority = e.target.value;
      setPriority(newPriority);
      
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ priority: newPriority }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update priority");
      }
      
      mutate();
      toast.success("Priority updated");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      // Revert state on error
      setPriority(task.priority);
    }
  }

  // Assign task to user
  async function handleAssign(e) {
    try {
      const userId = e.target.value;
      setAssignedTo(userId);
      
      const userEmail = users.find(u => u._id === userId)?.email;
      if (!userEmail) return;
      
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ assignedTo: [userEmail] }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to assign task");
      }
      
      mutate();
      toast.success(`Task assigned to ${userEmail}`);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      // Revert state on error
      setAssignedTo(task.assignedTo?.[0]?._id || "");
    }
  }

  // Toggle comments visibility
  function toggleComments() {
    setShowComments(!showComments);
  }

  // Get priority label & styling
  function getPriorityBadge(priority) {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Low</span>;
      default:
        return null;
    }
  }

  return (
    <div className="bg-white p-3 rounded shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-gray-800">{task.title}</h4>
        {getPriorityBadge(priority)}
      </div>
      
      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      <p className="text-xs text-gray-500 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
      
      {/* Status Selection */}
      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-700">Status:</label>
        <select
          className="mt-1 w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          value={status}
          onChange={handleStatusChange}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      
      {/* Priority Selection */}
      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-700">Priority:</label>
        <select
          className="mt-1 w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          value={priority}
          onChange={handlePriorityChange}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      
      {/* Assignment Dropdown */}
      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-700">Assign to:</label>
        <select
          className="mt-1 w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          value={assignedTo}
          onChange={handleAssign}
          disabled={isLoading}
        >
          <option value="">-- Unassigned --</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name || user.email}
            </option>
          ))}
        </select>
        {isLoading && <p className="text-xs text-gray-500 mt-1">Loading users...</p>}
      </div>

      {/* Comments Toggle Button */}
      <div className="mt-4">
        <button
          onClick={toggleComments}
          className="text-sm flex items-center text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          <span>{showComments ? "Hide Comments" : "Show Comments"}</span>
          <svg
            className={`ml-1 w-4 h-4 transition-transform ${showComments ? "rotate-180" : ""}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      
      {/* Conditional Rendering of Comments */}
      {showComments && <CommentSection taskId={task._id} />}
    </div>
  );
}