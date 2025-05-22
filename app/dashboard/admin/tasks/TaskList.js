"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TaskForm from "../TaskForm";
import { fetcherWithAuth } from "lib/fetcherWithAuth";
import CommentSection from "app/components/CommentSection";
import {
  MessageSquare,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react";

export default function TaskList({ projectId, refreshFlag, onTaskEdited }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openComments, setOpenComments] = useState({});
  // Track expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(10);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const endpoint = projectId
      ? `/api/tasks?projectId=${projectId}&page=${currentPage}&limit=${tasksPerPage}`
      : `/api/tasks?page=${currentPage}&limit=${tasksPerPage}`;

    fetcherWithAuth(endpoint)
      .then((data) => {
        if (data.tasks && data.total !== undefined) {
          setTasks(data.tasks);
          setTotalTasks(data.total);
          setTotalPages(
            data.totalPages || Math.ceil(data.total / tasksPerPage)
          );
        } else {
          // Fallback for backward compatibility
          setTasks(data);
          setTotalTasks(data.length);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Failed to fetch tasks");
        setLoading(false);
        console.error("Task fetch error:", error);
      });
  }, [projectId, refreshFlag, currentPage, tasksPerPage]);

  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Task deleted");

        // Refresh the current page
        const endpoint = projectId
          ? `/api/tasks?projectId=${projectId}&page=${currentPage}&limit=${tasksPerPage}`
          : `/api/tasks?page=${currentPage}&limit=${tasksPerPage}`;

        const data = await fetcherWithAuth(endpoint);

        // If this was the last item on the page and not the first page, go back one page
        if (data.tasks && data.tasks.length === 0 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          // Otherwise update with the current page data
          setTasks(data.tasks || []);
          setTotalTasks(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Delete failed");
      }
    } catch (error) {
      toast.error("Error deleting task");
      console.error("Delete task error:", error);
    }
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleTaskSaved = () => {
    setShowEditModal(false);
    setSelectedTask(null);

    const endpoint = projectId
      ? `/api/tasks?projectId=${projectId}&page=${currentPage}&limit=${tasksPerPage}`
      : `/api/tasks?page=${currentPage}&limit=${tasksPerPage}`;

    setLoading(true);
    fetcherWithAuth(endpoint)
      .then((data) => {
        if (data.tasks && data.total !== undefined) {
          setTasks(data.tasks);
          setTotalTasks(data.total);
          setTotalPages(
            data.totalPages || Math.ceil(data.total / tasksPerPage)
          );
        } else {
          // Fallback for backward compatibility
          setTasks(data);
          setTotalTasks(data.length);
          setTotalPages(1);
        }
        setLoading(false);
        if (onTaskEdited) onTaskEdited();
      })
      .catch(() => {
        toast.error("Failed to fetch updated tasks");
        setLoading(false);
      });
  };

  const toggleComments = (taskId) => {
    setOpenComments((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Toggle description expansion
  const toggleDescription = (taskId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Pagination controls
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePerPageChange = (e) => {
    setTasksPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold mb-4 text-[#4B0082]">
        {projectId ? "Project Tasks" : "All Tasks"}
      </h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4B0082]"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">
            No tasks found. Create a new task to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Tabular view of tasks with expandable rows */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {!projectId && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Project
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Due Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Assigned To
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <>
                    <tr key={task._id} className="hover:bg-gray-50">
                      {!projectId && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.projectName && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                              {task.projectName}
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        <div
                          onClick={() => toggleDescription(task._id)}
                          className={`text-sm text-gray-500 ${
                            expandedDescriptions[task._id] ? "" : "line-clamp-2"
                          } cursor-pointer group`}
                        >
                          {task.description}
                          {!expandedDescriptions[task._id] &&
                            task.description &&
                            task.description.length > 100 && (
                              <span className="text-indigo-600 ml-1 group-hover:underline inline-flex items-center">
                                <MoreHorizontal className="h-3 w-3 mr-1" />
                                Show more
                              </span>
                            )}
                          {expandedDescriptions[task._id] && (
                            <span className="text-indigo-600 ml-1 group-hover:underline inline-flex items-center">
                              Show less
                            </span>
                          )}
                        </div>
                        {task.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {task.dueDate?.slice(0, 10) || "Not set"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex -space-x-2">
                          {task.assignedTo?.length > 0 ? (
                            task.assignedTo.map((user, idx) => (
                              <div
                                key={idx}
                                className="w-7 h-7 rounded-full text-indigo-700 text-xs flex items-center justify-center font-semibold border border-white"
                                title={user.name || user.email}
                              >
                                {user.email?.substring(0, 5).toLowerCase() ||
                                  "?"}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400 text-sm">
                              Unassigned
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleComments(task._id)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            title={
                              openComments[task._id]
                                ? "Hide Comments"
                                : "Show Comments"
                            }
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {openComments[task._id] ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditClick(task)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Task"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expandable row for comments */}
                    {openComments[task._id] && (
                      <tr key={`comments-${task._id}`}>
                        <td
                          colSpan={projectId ? 6 : 7}
                          className="px-6 py-4 bg-gray-50"
                        >
                          <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium mb-2 text-gray-700">
                              Comments
                            </h4>
                            <CommentSection taskId={task._id} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {tasks.length > 0 ? (currentPage - 1) * tasksPerPage + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * tasksPerPage, totalTasks)}
                </span>{" "}
                of <span className="font-medium">{totalTasks}</span> tasks
              </span>
              <div className="ml-4">
                <select
                  value={tasksPerPage}
                  onChange={handlePerPageChange}
                  className="text-sm border-gray-300 rounded-md"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages || 1}</span>
              </div>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className={`p-2 rounded-md ${
                  currentPage >= totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <TaskForm
              projectId={selectedTask.projectId}
              selectedTask={selectedTask}
              onTaskSaved={handleTaskSaved}
            />
          </div>
        </div>
      )}
    </div>
  );
}
