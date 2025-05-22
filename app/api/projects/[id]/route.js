import connectDB from "lib/db"
import Project from "app/models/Project"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { ROLES } from "lib/constants"

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

// Helper function to check if user has access to a project
const hasProjectAccess = async (projectId, userId, userRole) => {
  const project = await Project.findById(projectId)

  if (!project) return false

  if (userRole === ROLES.ADMIN) {
    // Admins can only access projects they created
    return project.createdBy.toString() === userId
  } else if (userRole === ROLES.MANAGER || userRole === ROLES.MEMBER) {
    // Managers and members can access projects they're part of
    return project.teamMembers.some((member) => member.toString() === userId) || project.createdBy.toString() === userId
  }

  return false
}

export async function GET(req, { params }) {
  await connectDB()
  const id = params.id

  try {
    // Get user from token
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has access to this project
    const hasAccess = await hasProjectAccess(id, user.userId, user.role)
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const project = await Project.findById(id).populate("tasks teamMembers")
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  await connectDB()
  const id = params.id
  const data = await req.json()

  try {
    // Get user from token
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has access to this project
    const hasAccess = await hasProjectAccess(id, user.userId, user.role)
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const updatedProject = await Project.findByIdAndUpdate(id, data, {
      new: true,
    })
    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProject)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  await connectDB()
  const id = params.id
  const data = await req.json()

  try {
    // Get user from token
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has access to this project
    const hasAccess = await hasProjectAccess(id, user.userId, user.role)
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const updatedProject = await Project.findByIdAndUpdate(id, data, {
      new: true,
    })
    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProject)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  await connectDB()
  const id = params.id

  try {
    // Get user from token
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins who created the project can delete it
    const project = await Project.findById(id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (user.role !== ROLES.ADMIN || project.createdBy.toString() !== user.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const deleted = await Project.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Project deleted" })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
