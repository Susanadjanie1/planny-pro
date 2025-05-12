import connectDB from "lib/db"
import Task from "app/models/Task"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Update a comment
export async function PUT(req, { params }) {
  await connectDB()
  const { id: taskId, commentId } = params

  try {
    const { text, userId } = await req.json()

    if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    const task = await Task.findById(taskId)
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const comment = task.comments.id(commentId)
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if the user is the author of the comment
    if (comment.userId.toString() !== userId) {
      return NextResponse.json({ error: "Not authorized to edit this comment" }, { status: 403 })
    }

    // Update the comment
    comment.text = text
    comment.edited = true
    comment.editedAt = new Date()

    await task.save()

    return NextResponse.json({
      message: "Comment updated successfully",
      comment: comment,
    })
  } catch (err) {
    console.error("Error updating comment:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// Delete a comment
export async function DELETE(req, { params }) {
  await connectDB()
  const { id: taskId, commentId } = params

  try {
    // Extract userId from request headers or query params
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const task = await Task.findById(taskId)
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const comment = task.comments.id(commentId)
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if the user is the author of the comment
    if (comment.userId.toString() !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this comment" }, { status: 403 })
    }

    // Remove the comment
    task.comments.pull(commentId)
    await task.save()

    return NextResponse.json({
      message: "Comment deleted successfully",
    })
  } catch (err) {
    console.error("Error deleting comment:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
