'use client';

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function ProjectEditModal({
  isOpen,
  onClose,
  project,
  onUpdated,
}) {
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (isOpen && project) {
      setEditTitle(project.title || "");
      setEditDescription(project.description || "");
    }
  }, [project, isOpen]);

  const saveEdit = async () => {
    if (!project || !project._id) {
      toast.error("Invalid project ID");
      return;
    }

    try {
      const res = await fetch(`/api/projects/${project._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });

      if (res.ok) {
        const updated = await res.json();
        toast.success('Project updated successfully');
        onUpdated(updated); // Notify the parent component about the update
        onClose(); // Close the modal after updating
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Update failed');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Project</h2>
        <input
          className="border w-full p-2 mb-3 rounded"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Project Title"
        />
        <textarea
          className="border w-full p-2 mb-3 rounded"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Project Description"
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={saveEdit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
