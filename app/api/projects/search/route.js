import { NextResponse } from "next/server"
import connectDB from "lib/db"
import Project from "app/models/Project"
import { verifyToken } from "lib/auth"
import { ROLES } from "lib/constants"

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
      return NextResponse.json({ projects: [] })
    }

    // Create a search filter based on user role
    const filter = {
      $or: [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }],
    }

    // Add role-based filtering
    if (user.role === ROLES.MEMBER) {
      // Members can only see projects they're assigned to
      filter.members = user.userId
    } else if (user.role === ROLES.MANAGER) {
      // Managers can see projects they created or are assigned to
      filter.$and = [
        {
          $or: [{ createdBy: user.userId }, { members: user.userId }],
        },
      ]
    }
    // Admins can see all projects

    const projects = await Project.find(filter).sort({ updatedAt: -1 }).limit(5).lean()

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Project search error:", error)
    return NextResponse.json({ error: "Failed to search projects" }, { status: 500 })
  }
}
