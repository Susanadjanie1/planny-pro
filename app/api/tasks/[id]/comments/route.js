import connectDB from "../../../../../lib/db"
import Task from "../../../../models/Task"
import { ROLES } from "../../../../../lib/constants"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"

// Helper function to get user from request
const getUserFromRequest = async (req) => {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null

  const token = authHeader.split(" ")[1]
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    console.error("JWT verify failed:", err)
    return null
  }
}

// Add a comment to a task
export async function POST(req, { params }) {
  await connectDB()

  try {
    const user = await getUserFromRequest(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskId = params.id
    const { text, parentId } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    // Find the task
    const task = await Task.findById(taskId)
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user can comment (assigned to task, created task, or is manager/admin)
    const canComment =
      user.role === ROLES.ADMIN ||
      user.role === ROLES.MANAGER ||
      task.assignedTo.some((id) => id.toString() === user.userId) ||
      task.createdBy.toString() === user.userId

    if (!canComment) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Add comment
    const comment = {
      userId: user.userId,
      text,
      timestamp: new Date(),
      parentId: parentId || null,
      reactions: [],
    }

    task.comments.push(comment)
    await task.save()

    // Return the updated task with populated comments
    const updatedTask = await Task.findById(taskId)
      .populate("comments.userId", "name email")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    // Find the newly created comment
    const newComment = updatedTask.comments[updatedTask.comments.length - 1]

    return NextResponse.json({
      message: "Comment added successfully",
      task: updatedTask,
      comment: newComment,
    })
  } catch (error) {
    console.error("POST /api/tasks/[id]/comments failed:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}

// Get comments for a task
export async function GET(req, { params }) {
  await connectDB()

  try {
    const user = await getUserFromRequest(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskId = params.id

    // Find the task
    const task = await Task.findById(taskId).populate("comments.userId", "name email")
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ comments: task.comments })
  } catch (error) {
    console.error("GET /api/tasks/[id]/comments failed:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
