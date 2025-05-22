"use client";

import KanbanBoard from "../../kanban/KanbanBoard";

export default function ManagerDashboard({ session }) {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Manager Panel – {session.user.name}
        </h1>
      </div>

      <div className="space-y-6">
        <KanbanBoard />
      </div>
    </div>
  );
}
