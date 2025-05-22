"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  ListTodo,
  ClipboardList,
  UserCircle,
  LogOut,
  Shield,
  Users,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

function hasPermission(userRole, requiredRole) {
  const ROLE_PERMISSIONS = {
    admin: ["admin", "manager", "member"],
    manager: ["manager", "member"],
    member: ["member"],
  };
  return ROLE_PERMISSIONS[userRole]?.includes(requiredRole) || false;
}

function getButtonClass(isActive) {
  return `flex items-center w-full p-2 rounded-lg transition-colors ${
    isActive ? "bg-indigo-800 font-medium" : "hover:bg-indigo-800/50"
  }`;
}

export default function Sidebar({
  activeView,
  setActiveView,
  selectedProjectId,
}) {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role);
      } catch (err) {
        console.error("Error parsing token:", err);
      }
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="fixed top-4 left-4 z-50 p-2 bg-indigo-900 text-white rounded-md md:hidden"
        >
          <LayoutDashboard size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-indigo-900 text-white shadow-lg z-10 flex flex-col justify-between transition-all duration-300 ${
          isMobile
            ? collapsed
              ? "-translate-x-full"
              : "translate-x-0 w-64"
            : collapsed
            ? "w-20"
            : "w-64"
        }`}
      >
        {/* Toggle Button - Positioned at the middle of the right edge */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-indigo-900 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors z-20"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between text-sm py-4 max-h-screen overflow-hidden">
          <div className="space-y-6">
            {/* Header/Logo Area */}
            <div className="px-4 py-2">
              {!collapsed && (
                <h2 className="text-lg font-bold">Task Manager</h2>
              )}
            </div>

            <div className="px-4">
              {!collapsed && (
                <p className="text-xs uppercase tracking-wider opacity-70 mb-2">
                  Navigation
                </p>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveView("dashboard")}
                  className={getButtonClass(activeView === "dashboard")}
                >
                  <LayoutDashboard className="h-5 w-5 mr-3" />
                  {!collapsed && <span>Dashboard</span>}
                </button>
                <button
                  onClick={() => setActiveView("createProject")}
                  className={getButtonClass(activeView === "createProject")}
                >
                  <FilePlus className="h-5 w-5 mr-3" />
                  {!collapsed && <span>Create Project</span>}
                </button>
                <button
                  onClick={() => setActiveView("projects")}
                  className={getButtonClass(activeView === "projects")}
                >
                  <ClipboardList className="h-5 w-5 mr-3" />
                  {!collapsed && <span>View All Projects</span>}
                </button>
              </div>
            </div>

            <div className="px-4">
              {!collapsed && (
                <p className="text-xs uppercase tracking-wider opacity-70 mb-2">
                  Task Management
                </p>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveView("createTask")}
                  className={getButtonClass(activeView === "createTask")}
                >
                  <FilePlus className="h-5 w-5 mr-3" />
                  {!collapsed && <span>Create Task</span>}
                </button>
                <button
                  onClick={() => setActiveView("allTasks")}
                  className={getButtonClass(activeView === "allTasks")}
                >
                  <ListTodo className="h-5 w-5 mr-3" />
                  {!collapsed && <span>View All Tasks</span>}
                </button>

                {selectedProjectId && (
                  <button
                    onClick={() => setActiveView("tasks")}
                    className={getButtonClass(activeView === "tasks")}
                  >
                    <ListTodo className="h-5 w-5 mr-3" />
                    {!collapsed && <span>Manage Tasks</span>}
                  </button>
                )}
              </div>
            </div>

            <div className="px-4">
              {!collapsed && (
                <p className="text-xs uppercase tracking-wider opacity-70 mb-2">
                  Role Views
                </p>
              )}
              <div className="space-y-1">
                {userRole === "admin" && (
                  <button
                    onClick={() => router.push("/dashboard/admin")}
                    className={getButtonClass(false)}
                  >
                    <Shield className="h-5 w-5 mr-3" />
                    {!collapsed && <span>Admin View</span>}
                  </button>
                )}
                {hasPermission(userRole, "manager") && (
                  <button
                    onClick={() => router.push("/dashboard/manager")}
                    className={getButtonClass(false)}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    {!collapsed && <span>Manager View</span>}
                  </button>
                )}
                <button
                  onClick={() => router.push("/dashboard/member")}
                  className={getButtonClass(false)}
                >
                  <UserCircle className="h-5 w-5 mr-3" />
                  {!collapsed && <span>Member View</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-indigo-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg transition-colors hover:bg-indigo-800/50 text-[#FFD700] hover:text-red-200"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setCollapsed(true)}
        ></div>
      )}
    </>
  );
}
