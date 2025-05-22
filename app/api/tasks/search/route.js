import { NextResponse } from "next/server"
import connectDB from "../../../../lib/db"
import Task from "../../../models/Task"
import { verifyToken } from "../../../../lib/auth"
import { ROLES } from "../../../../lib/constants"
import mongoose from "mongoose"

export async function GET(req) {
  try {
    await connectDB()

    const user = verifyToken(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ tasks: [] })
    }

    // Create a search filter based on user role
    const filter = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    }

    // Add role-based filtering
    if (user.role === ROLES.MEMBER) {
      // Members only see tasks assigned to them
      filter.assignedTo = new mongoose.Types.ObjectId(user.userId)
    } else if (user.role === ROLES.MANAGER) {
      // Managers see tasks they created or are assigned to them
      filter.$and = [
        {
          $or: [
            { createdBy: new mongoose.Types.ObjectId(user.userId) },
            { assignedTo: new mongoose.Types.ObjectId(user.userId) },
          ],
        },
      ]
    }
    // Admins can see all tasks

    const tasks = await Task.find(filter).populate("projectId", "title").sort({ updatedAt: -1 }).limit(5).lean()

    // Format tasks with project names and include projectId in the response
    const formattedTasks = tasks.map((task) => ({
      ...task,
      projectName: task.projectId?.title || null,
      // Ensure projectId is included in the response
      projectId: task.projectId?._id || task.projectId || null,
    }))

    return NextResponse.json({ tasks: formattedTasks })
  } catch (error) {
    console.error("Task search error:", error)
    return NextResponse.json({ error: "Failed to search tasks" }, { status: 500 })
  }
}
