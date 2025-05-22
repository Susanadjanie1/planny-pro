"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboardClient from "./DashboardPage";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        router.push("/unauthorized");
        return;
      }
      setUser({ role: payload.role, id: payload.userId });
    } catch (err) {
      router.push("/auth/login");
    }
  }, [router]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <AdminDashboardClient session={user} />
    </div>
  );
}
