"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import KanbanBoard from "../../kanban/KanbanBoard"
import { fetcherWithAuth } from "../../../lib/fetcherWithAuth"

export default function MemberDashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const { data, error, mutate } = useSWR("/api/tasks", fetcherWithAuth);

  console.log("Raw API response:", data);

  const tasks = data?.tasks || data;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.role !== "member" && payload.role !== "admin") {
        router.push("/unauthorized");
        return;
      }

      localStorage.setItem("userId", payload.userId);

      setUser({
        role: payload.role,
        id: payload.userId,
        name: payload.name,
        email: payload.email,
      });

      console.log("User authenticated:", {
        role: payload.role,
        id: payload.userId,
      });
    } catch (err) {
      console.error("Token validation error:", err);
      localStorage.removeItem("token");
      router.push("/auth/login");
    }
  }, [router]);

  if (!user) return <div className="p-4">Loading user data...</div>;
  if (error)
    return (
      <div className="p-4 text-red-500">
        Failed to load data: {error.message}
      </div>
    );
  if (!tasks) return <div className="p-4">Loading tasks data...</div>;

  console.log(
    "Tasks available:",
    Array.isArray(tasks) ? tasks.length : "not an array"
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">
          MemberDashboard
        </h1>
      </div>

      <div className="space-y-6">
        <KanbanBoard tasks={tasks} mutate={mutate} userId={user.id} userRole={user.role} />

      </div>
    </div>
  );
}
