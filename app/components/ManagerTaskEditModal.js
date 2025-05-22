"use client";
import { useState } from "react";
import { update } from "lib/api/update";

export default function ManagerTaskEditModal({ task, onClose }) {
  const [status, setStatus] = useState(task.status || "");
  const [priority, setPriority] = useState(task.priority || "");
  const [assignedTo, setAssignedTo] = useState(
    task.assignedTo.map((u) => u.email)
  );
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await update(task._id, { status, priority, assignedTo }, token);
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded">
      <h2 className="text-lg font-semibold mb-2">Edit Task</h2>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="mb-2"
      >
        <option value="">Select Status</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="mb-2"
      >
        <option value="">Select Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input
        type="text"
        placeholder="Assigned emails (comma separated)"
        value={assignedTo.join(",")}
        onChange={(e) => setAssignedTo(e.target.value.split(","))}
        className="mb-2 w-full"
      />

      <button type="submit" className="btn btn-primary">
        Save
      </button>
    </form>
  );
}
