import connectDB from "lib/db"
import Task from "app/models/Task"
import { ROLES } from "lib/constants"
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

// Edit a comment
export async function PUT(req, { params }) {
  await connectDB()

  try {
    const user = await getUserFromRequest(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: taskId, commentId } = params
    const { text } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    // Find the task
    const task = await Task.findById(taskId)
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Find the comment
    const comment = task.comments.id(commentId)
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if user can edit the comment (comment author or admin)
    const canEdit = user.role === ROLES.ADMIN || comment.userId.toString() === user.userId

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update the comment
    comment.text = text
    comment.edited = true
    comment.editedAt = new Date()

    await task.save()

    return NextResponse.json({
      message: "Comment updated successfully",
      comment,
    })
  } catch (error) {
    console.error("PUT /api/tasks/[id]/comments/[commentId] failed:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

// Delete a comment
export async function DELETE(req, { params }) {
  await connectDB()

  try {
    const user = await getUserFromRequest(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: taskId, commentId } = params

    // Find the task
    const task = await Task.findById(taskId)
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Find the comment
    const comment = task.comments.id(commentId)
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if user can delete the comment (comment author or admin)
    const canDelete = user.role === ROLES.ADMIN || comment.userId.toString() === user.userId

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Remove the comment
    task.comments.pull(commentId)
    await task.save()

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/tasks/[id]/comments/[commentId] failed:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
