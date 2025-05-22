import connectDB from "lib/db"
import Task from "../../models/Task"
import User from "../../models/User"
import jwt from "jsonwebtoken"
import { ROLES } from "lib/constants"
import mongoose from "mongoose"

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
  try {
    await connectDB()

    // Make sure Project model is registered
    if (!mongoose.models.Project) {
      console.log("Project model not found, importing it")
      require("app/models/Project")
    }

    const user = await getUserFromRequest(req)

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    // Pagination parameters
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const skip = (page - 1) * limit

    const filter = {}

    if (user.role === ROLES.MEMBER) {
      // Members only see tasks assigned to them
      filter.assignedTo = new mongoose.Types.ObjectId(user.userId)
    } else if (user.role === ROLES.MANAGER) {
      if (projectId) {
        // If viewing a specific project, show ALL tasks in that project
        filter.projectId = new mongoose.Types.ObjectId(projectId)
      } else {
        // If not viewing a specific project, show:
        // 1. Tasks assigned to the manager
        // 2. Tasks created by the manager
        // 3. Tasks last assigned by the manager (new condition)
        filter.$or = [
          { assignedTo: new mongoose.Types.ObjectId(user.userId) },
          { createdBy: new mongoose.Types.ObjectId(user.userId) },
        ]
        
        // Only add lastAssignedBy to the filter if it exists in the schema
        // This prevents errors during the transition period
        try {
          if (Task.schema.paths.lastAssignedBy) {
            filter.$or.push({ lastAssignedBy: new mongoose.Types.ObjectId(user.userId) })
          }
        } catch (err) {
          console.log("lastAssignedBy field not yet in schema, skipping in filter")
        }
      }

      console.log("Manager filter:", JSON.stringify(filter, null, 2))
    } else if (user.role === ROLES.ADMIN) {
      // Admins can filter by project if specified
      if (projectId) {
        filter.projectId = new mongoose.Types.ObjectId(projectId)
      }
      // Otherwise, admins see all tasks they created
      else {
        filter.createdBy = new mongoose.Types.ObjectId(user.userId)
      }
    }

    console.log("Filtering tasks with:", filter)

    // Get total count for pagination
    const total = await Task.countDocuments(filter)

    // Get paginated tasks - without lastAssignedBy initially
    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("projectId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Try to populate lastAssignedBy separately with strictPopulate: false
    try {
      await Task.populate(tasks, {
        path: "lastAssignedBy",
        select: "name email",
        strictPopulate: false
      });
    } catch (err) {
      console.log("Could not populate lastAssignedBy field:", err.message)
      // Continue without this population - it's not critical
    }

    // Process tasks to include project name for the frontend
    const processedTasks = tasks.map((task) => {
      const taskObj = task.toObject()
      if (taskObj.projectId && taskObj.projectId.title) {
        taskObj.projectName = taskObj.projectId.title
      }
      return taskObj
    })

    return new Response(
      JSON.stringify({
        tasks: processedTasks,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("GET /api/tasks failed:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch tasks", details: error.message }), {
      status: 500,
    })
  }
}

export async function POST(req) {
  try {
    await connectDB()
    const user = await getUserFromRequest(req)

    if (!user || ![ROLES.ADMIN, ROLES.MANAGER].includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      })
    }

    const { title, description, assignedTo, priority, dueDate, projectId } = await req.json()

    const assignedUserIds = await User.find({
      email: { $in: assignedTo },
    }).then((users) => users.map((user) => user._id.toString()))

    // Create task object with basic fields
    const taskData = {
      title,
      description,
      assignedTo: assignedUserIds[0],
      priority,
      dueDate,
      projectId,
      createdBy: user.userId,
    }

    // Try to add lastAssignedBy field if it exists in the schema
    try {
      if (Task.schema.paths.lastAssignedBy) {
        taskData.lastAssignedBy = user.userId
      }
    } catch (err) {
      console.log("lastAssignedBy field not yet in schema, skipping in new task")
    }

    const newTask = new Task(taskData)
    await newTask.save()

    return new Response(JSON.stringify(newTask), { status: 201 })
  } catch (error) {
    console.error("POST /api/tasks failed:", error)
    return new Response(JSON.stringify({ error: "Failed to create task" }), {
      status: 500,
    })
  }
}