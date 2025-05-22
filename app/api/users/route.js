import connectDB from "lib/db"
import User from "../../models/User"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { ROLES } from "lib/constants"

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

export async function GET(req) {
  await connectDB()

  try {
    const user = await getUserFromRequest(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User requesting users list:", user)

    // Filter users based on role
    let query = {}

    // If manager, only show members (not admins)
    if (user.role === ROLES.MANAGER) {
      query = { role: ROLES.MEMBER }
    }
    // If admin, show both managers and members
    else if (user.role === ROLES.ADMIN) {
      query = { role: { $in: [ROLES.MANAGER, ROLES.MEMBER] } }
    }

    console.log("Fetching users with query:", query)

    // Get filtered users for assignment
    const users = await User.find(query, "name email role")

    console.log(`Found ${users.length} users for assignment`)

    return NextResponse.json({ users })
  } catch (error) {
    console.error("GET /api/users failed:", error)
    return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 })
  }
}
