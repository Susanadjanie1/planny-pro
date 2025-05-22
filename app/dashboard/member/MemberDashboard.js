"use client";

import KanbanBoard from "../../kanban/KanbanBoard";

export default function MemberDashboard({ session, tasks, mutate }) {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tasks – {session.user.email}</h1>
      </div>

      <div className="space-y-6">
        <KanbanBoard tasks={tasks} mutate={mutate} userId={session.user.id} />
      </div>
    </div>
  );
}
