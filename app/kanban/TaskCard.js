"use client"

import ManagerTaskCard from "./ManagerTaskCard"
import MemberTaskCard from "./MemberTaskCard"

export default function TaskCard({ task, mutate, userRole, onMoveTask, columnId }) {
  if (!userRole) return null

  const roleComponents = {
    admin: (props) => <ManagerTaskCard {...props} isAdmin={true} />,
    manager: ManagerTaskCard,
    member: MemberTaskCard,
  }

  const RoleCard = roleComponents[userRole]

  return RoleCard ? (
    <RoleCard
      task={task}
      mutate={mutate}
      onMoveTask={onMoveTask}
      columnId={columnId}
    />
  ) : null
}
