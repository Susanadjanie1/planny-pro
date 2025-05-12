"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ProjectEditModal from "../ProjectEditModal";
import { FiEdit, FiTrash2 } from "react-icons/fi";

// ...imports remain the same
export default function ProjectList({ refreshFlag, onProjectSelect }) {
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        } else throw new Error("Invalid response format");
      } catch (error) {
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [refreshFlag]);

  const deleteProject = (id) => {
    const toastId = toast.info(
      <div className="space-y-3">
        <p className="font-semibold text-sm">Confirm delete this project?</p>
        <div className="flex justify-end gap-3">
          <button
            className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => toast.dismiss(toastId)}
          >
            Cancel
          </button>
          <button
            className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
            onClick={async () => {
              toast.dismiss(toastId);
              try {
                const res = await fetch(`/api/projects/${id}`, {
                  method: "DELETE",
                });
                if (res.ok) {
                  setProjects((prev) => prev.filter((p) => p._id !== id));
                  toast.success("Project deleted");
                } else throw new Error("Delete failed");
              } catch (error) {
                toast.error(error.message);
              }
            }}
          >
            Yes, delete
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  const handleUpdate = (updatedProject) => {
    setProjects(
      projects.map((p) => (p._id === updatedProject._id ? updatedProject : p))
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">All Projects</h2>
      {loading ? (
        <p className="text-gray-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => onProjectSelect?.(project._id)}
              className="bg-white rounded-2xl shadow-md p-5 border hover:border-blue-400 hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="font-bold text-lg">{project.title}</h3>
              <p className="text-gray-600 mt-1">{project.description}</p>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(project);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project._id);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectEditModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onUpdated={handleUpdate}
      />
    </div>
  );
}
