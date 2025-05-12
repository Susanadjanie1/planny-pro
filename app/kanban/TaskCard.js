"use client";

import { useState, useEffect } from "react";
import ManagerTaskCard from "./ManagerTaskCard";
import MemberTaskCard from "./MemberTaskCard";
import BasicTaskCard from "./BasicTaskCard";

export default function TaskCard({ task, mutate, userRole }) {
  // Default to a basic view if no role is provided
  if (!userRole) {
    // return <BasicTaskCard task={task} />;
  }
  
  // Render the appropriate card based on user role
  switch (userRole) {
    case "manager":
      return <ManagerTaskCard task={task} mutate={mutate} />;
    case "member":
      return <MemberTaskCard task={task} mutate={mutate} />;
    default:
      // return <BasicTaskCard task={task} />;
  }
}