import connectDB from "../../../../../lib/db"
import Task from "../../../../models/Task"
import User from "../../../../models/User"
import { ROLES } from "../../../../../lib/constants"
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Helper function to get user from request
const getUserFromRequest = async (req) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT verify failed:", err);
    return null;
  }
};

// Assign a task to a user
export async function PUT(req, { params }) {
  await connectDB();

  try {
    const user = await getUserFromRequest(req);

    if (!user || ![ROLES.ADMIN, ROLES.MANAGER].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fix: Use params.id directly
    const taskId = params.id;
    const { assignedTo } = await req.json();

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Handle different formats of assignedTo
    let userIds = [];
    if (typeof assignedTo === "string") {
      // Single user ID
      userIds = [assignedTo];
    } else if (Array.isArray(assignedTo)) {
      // Array of user IDs or emails
      if (assignedTo.length > 0 && typeof assignedTo[0] === "string") {
        // Check if they're emails
        if (assignedTo[0].includes("@")) {
          const users = await User.find({ email: { $in: assignedTo } });
          userIds = users.map((u) => u._id);
        } else {
          userIds = assignedTo;
        }
      }
    }

    // Update the task
    task.assignedTo = userIds;

    // Try to set lastAssignedBy if it exists in the schema
    try {
      if ("lastAssignedBy" in task.schema.paths) {
        task.lastAssignedBy = user.userId;
      }
    } catch (err) {
      console.log("Could not set lastAssignedBy field:", err.message);
    }

    await task.save();

    // Return the updated task
    const updatedTask = await Task.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("projectId", "title");

    // Try to populate lastAssignedBy separately
    try {
      await Task.populate(updatedTask, {
        path: "lastAssignedBy",
        select: "name email",
        strictPopulate: false,
      });
    } catch (err) {
      console.log("Could not populate lastAssignedBy field:", err.message);
    }

    return NextResponse.json({
      message: "Task assigned successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("PUT /api/tasks/[id]/assign failed:", error);
    return NextResponse.json(
      { error: "Failed to assign task" },
      { status: 500 }
    );
  }
}
