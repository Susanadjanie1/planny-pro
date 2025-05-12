import connectDB from "lib/db"
import Task from "app/models/Task"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

export async function GET(req, { params }) {
  await connectDB()
  const { id } = params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
  }

  try {
    const task = await Task.findById(id).populate("comments.userId", "email name")
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    return NextResponse.json({ comments: task.comments })
  } catch (err) {
    console.error("Error fetching comments:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// Update the POST function to ensure email is properly stored
export async function POST(req, { params }) {
  await connectDB()
  const { id } = params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
  }

  try {
    const { userId, email, text, parentId } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    const task = await Task.findById(id)
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    // Create comment object with user info
    const comment = {
      text,
      timestamp: new Date(),
      reactions: [],
    }

    // Add user reference if userId is available
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      comment.userId = userId
    } else if (email) {
      // Create a user-like object with email if userId is not available
      comment.user = { email: email }
    } else {
      comment.user = { email: "Anonymous" }
    }

    // Add parentId if it's a reply
    if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
      // Check if parent comment exists
      const parentComment = task.comments.id(parentId)
      if (!parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 })
      }
      comment.parentId = parentId
    }

    task.comments.push(comment)
    await task.save()

    // Return the newly added comment
    const addedComment = task.comments[task.comments.length - 1]

    // If userId is a valid ObjectId, populate it
    let commentResponse = addedComment
    if (addedComment.userId && mongoose.Types.ObjectId.isValid(addedComment.userId)) {
      const updatedTask = await Task.findById(id).populate("comments.userId", "email name")
      commentResponse = updatedTask.comments.find((c) => c._id.toString() === addedComment._id.toString())
    }

    return NextResponse.json({
      message: "Comment added",
      comment: commentResponse,
    })
  } catch (err) {
    console.error("Error adding comment:", err)
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 })
  }
}
