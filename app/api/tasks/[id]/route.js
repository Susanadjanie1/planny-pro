import connectDB from "lib/db";
import Task from "../../../models/Task"
import Project from "../../../models/Project"
import User from "../../../models/User";
import { ROLES } from "../../../../lib/constants"
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Get user from JWT
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

// GET: Get a single task
export async function GET(req, { params }) {
  await connectDB();

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await Task.findById(params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("projectId", "title");

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("GET /api/tasks/[id] failed:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PUT: Update a task
export async function PUT(req, { params }) {
  await connectDB();

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.id;
    const updates = await req.json();
    const task = await Task.findById(taskId);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Permissions
    const isAdmin = user.role === ROLES.ADMIN;
    const isManager = user.role === ROLES.MANAGER;
    const isMember = user.role === ROLES.MEMBER;

    if (!isAdmin && !isManager && !isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🛑 Restrict Team Members from changing priority or assignedTo
    if (isMember) {
      const allowedFields = ["status", "comments", "timeLogged"];
      Object.keys(updates).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete updates[key];
        }
      });
    }

    // ✅ Log Time for Team Members
    if (updates.timeLogged && isMember) {
      if (!task.timeLogs) task.timeLogs = [];
      task.timeLogs.push({
        userId: user.userId,
        hours: updates.timeLogged,
        date: new Date(),
      });
      await task.save();
      return NextResponse.json(task);
    }

    // ✅ Handle assignedTo (for Admins/Managers only)
    if ((isAdmin || isManager) && updates.assignedTo) {
      try {
        if (typeof updates.assignedTo === "string" && updates.assignedTo.includes("@")) {
          const assignedUser = await User.findOne({ email: updates.assignedTo });
          if (!assignedUser) {
            return NextResponse.json(
              { error: `User with email ${updates.assignedTo} not found` },
              { status: 404 }
            );
          }
          updates.assignedTo = [assignedUser._id];
        } else if (Array.isArray(updates.assignedTo)) {
          const processed = [];
          for (const item of updates.assignedTo) {
            if (typeof item === "string" && item.includes("@")) {
              const found = await User.findOne({ email: item });
              if (!found) {
                return NextResponse.json(
                  { error: `User with email ${item} not found` },
                  { status: 404 }
                );
              }
              processed.push(found._id);
            } else {
              processed.push(item);
            }
          }
          updates.assignedTo = processed;
        }
      } catch (error) {
        return NextResponse.json({ error: "Error processing assignedTo", details: error.message }, { status: 500 });
      }
    }

    // ✅ Update task
    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("projectId", "title");

    // ✅ Update project metrics if status changed
    if (updates.status && task.status !== updates.status) {
      await Project.findById(task.projectId).then((project) => {
        if (project) {
          console.log(`Status changed from ${task.status} to ${updates.status} in project: ${project.title}`);
        }
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PUT /api/tasks/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update task", details: error.message }, { status: 500 });
  }
}

// DELETE: Only admins can delete
export async function DELETE(req, { params }) {
  await connectDB();

  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Forbidden - Only admins can delete tasks" }, { status: 403 });
    }

    const deleted = await Task.findByIdAndDelete(params.id);
    return deleted
      ? NextResponse.json({ message: "Deleted successfully" })
      : NextResponse.json({ error: "Task not found" }, { status: 404 });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
