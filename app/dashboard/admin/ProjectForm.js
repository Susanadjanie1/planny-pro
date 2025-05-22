"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProjectForm({ project = null, onProjectCreated }) {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [teamMembers, setTeamMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setTeamMembers(
        project.teamMembers?.map((member) => ({
          value: member._id || member,
          label: member.email,
        })) || []
      );
    }

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          const options = data.map((user) => ({
            value: user._id,
            label: `${user.email} (${user.role})`,
          }));
          setUsers(options);
        } else {
          console.error("Error fetching users:", data?.error);
        }
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    fetchUsers();
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return alert("User not authenticated.");

    const method = project ? "PATCH" : "POST";
    const url = project ? `/api/projects/${project._id}` : "/api/projects";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        teamMembers: teamMembers.map((u) => u.value),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setTitle("");
      setDescription("");
      setTeamMembers([]);
      onProjectCreated?.();
      setIsOpen(false);
    } else {
      alert("Failed to save project: " + (data.error || "Unknown error"));
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#4B0082] text-white px-6 py-3 rounded-full hover:bg-[#967fa7] transition"
      >
        {project ? "Edit Project" : "Create Project"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {project ? "Update Project" : "Create Project"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />

              <textarea
                placeholder="Project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />

              <label className="block text-sm font-medium text-gray-700">
                Assign Team Members
              </label>
              <Select
                isMulti
                options={users}
                value={teamMembers}
                onChange={setTeamMembers}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select team members"
              />

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#4B0082] text-white px-6 py-2 rounded hover:bg-[#967fa7]"
                >
                  {project ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
