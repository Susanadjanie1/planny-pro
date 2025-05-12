'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  FilePlus,
  ListTodo,
  ClipboardList,
  UserCircle,
  LogOut,
  Shield,
  Users,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

function hasPermission(userRole, requiredRole) {
  const ROLE_PERMISSIONS = {
    admin: ['admin', 'manager', 'member'],
    manager: ['manager', 'member'],
    member: ['member']
  };
  return ROLE_PERMISSIONS[userRole]?.includes(requiredRole) || false;
}

function getButtonClass(isActive) {
  return `flex items-center w-full p-2 rounded-lg transition-colors ${
    isActive ? 'bg-indigo-800 font-medium' : 'hover:bg-indigo-800/50'
  }`;
}

export default function Sidebar({ activeView, setActiveView, selectedProjectId }) {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-indigo-900 text-white shadow-lg z-10 flex flex-col justify-between transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:text-yellow-400 transition"
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between text-sm py-4">
        <div className="space-y-6">
          <div className="px-4">
            {!collapsed && <p className="text-xs uppercase tracking-wider opacity-70 mb-2">Navigation</p>}
            <div className="space-y-1">
              <button onClick={() => setActiveView('dashboard')} className={getButtonClass(activeView === 'dashboard')}>
                <LayoutDashboard className="h-5 w-5 mr-3" />
                {!collapsed && <span>Dashboard</span>}
              </button>
              <button onClick={() => setActiveView('createProject')} className={getButtonClass(activeView === 'createProject')}>
                <FilePlus className="h-5 w-5 mr-3" />
                {!collapsed && <span>Create Project</span>}
              </button>
              <button onClick={() => setActiveView('projects')} className={getButtonClass(activeView === 'projects')}>
                <ClipboardList className="h-5 w-5 mr-3" />
                {!collapsed && <span>Projects</span>}
              </button>
            </div>
          </div>

          <div className="px-4">
            {!collapsed && <p className="text-xs uppercase tracking-wider opacity-70 mb-2">Task Management</p>}
            <div className="space-y-1">
              <button onClick={() => setActiveView('allTasks')} className={getButtonClass(activeView === 'allTasks')}>
                <ListTodo className="h-5 w-5 mr-3" />
                {!collapsed && <span>View All Tasks</span>}
              </button>
              <button onClick={() => setActiveView('createTask')} className={getButtonClass(activeView === 'createTask')}>
                <FilePlus className="h-5 w-5 mr-3" />
                {!collapsed && <span>Create Task</span>}
              </button>
              {selectedProjectId && (
                <button onClick={() => setActiveView('tasks')} className={getButtonClass(activeView === 'tasks')}>
                  <ListTodo className="h-5 w-5 mr-3" />
                  {!collapsed && <span>Manage Tasks</span>}
                </button>
              )}
            </div>
          </div>

          <div className="px-4">
            {!collapsed && <p className="text-xs uppercase tracking-wider opacity-70 mb-2">Role Views</p>}
            <div className="space-y-1">
              {userRole === 'admin' && (
                <button onClick={() => router.push('/dashboard/admin')} className={getButtonClass(false)}>
                  <Shield className="h-5 w-5 mr-3" />
                  {!collapsed && <span>Admin View</span>}
                </button>
              )}
              {hasPermission(userRole, 'manager') && (
                <button onClick={() => router.push('/dashboard/manager')} className={getButtonClass(false)}>
                  <Users className="h-5 w-5 mr-3" />
                  {!collapsed && <span>Manager View</span>}
                </button>
              )}
              <button onClick={() => router.push('/dashboard/member')} className={getButtonClass(false)}>
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
  );
}
