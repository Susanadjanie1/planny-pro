"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import KanbanBoard from "../../kanban/KanbanBoard"
import ProjectMetrics from "../../kanban/ProjectMetrics"
import { fetcherWithAuth } from "../../../lib/fetcherWithAuth"

export default function ManagerDashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const { data: tasks, error, mutate } = useSWR("/api/tasks", fetcherWithAuth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.role !== "manager" && payload.role !== "admin") {
        router.push("/unauthorized");
        return;
      }
      setUser({
        role: payload.role,
        id: payload.userId,
        name: payload.name,
        email: payload.email,
      });
    } catch (err) {
      console.error("Token validation error:", err);
      localStorage.removeItem("token");
      router.push("/auth/login");
    }
  }, [router]);

  if (!user || !tasks) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Failed to load tasks</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#4B0082] dark:text-indigo-300">
          Manager Dashboard
        </h1>
      </div>

      <div className="space-y-8">
        <ProjectMetrics tasks={tasks} />
        <KanbanBoard tasks={tasks} mutate={mutate} />
      </div>
    </div>
  );
}
