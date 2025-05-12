"use client";

import KanbanBoard from "../../kanban/KanbanBoard";
import LogoutButton from "../../components/LogoutButton";
import ProjectMetrics from "app/kanban/ProjectMetrics";

export default function ManagerDashboard({ session }) {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Manager Panel – {session.user.name}
        </h1>
        {/* <LogoutButton /> */}
      </div>

      {/* <div className="space-y-6">
        <ProjectMetrics tasks={tasks} />
        <KanbanBoard />
      </div> */}

      <div className="space-y-6">
        <KanbanBoard />
        {/* Add task assignment or metrics display */}
      </div>
    </div>
  );
}
