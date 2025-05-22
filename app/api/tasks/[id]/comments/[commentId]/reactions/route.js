import connectDB from "lib/db"
import Task from "app/models/Task"
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

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

export async function POST(req, { params }) {
  await connectDB()
  const { id: taskId, commentId } = params

  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { emoji } = await req.json()
    const userId = user.userId

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

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

    if (!comment.reactions) {
      comment.reactions = []
    }

    const existingReactionIndex = comment.reactions.findIndex(
      (r) => r.emoji === emoji && r.userId.toString() === userId,
    )

    if (existingReactionIndex > -1) {
      comment.reactions.splice(existingReactionIndex, 1)
    } else {
      comment.reactions.push({
        userId: userId,
        emoji: emoji,
      })
    }

    await task.save()

    const groupedReactions = comment.reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        }
      }
      acc[reaction.emoji].count++
      acc[reaction.emoji].users.push(reaction.userId.toString())
      return acc
    }, {})

    return NextResponse.json({
      message: "Reaction toggled successfully",
      reactions: Object.values(groupedReactions),
    })
  } catch (err) {
    console.error("Error toggling reaction:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
