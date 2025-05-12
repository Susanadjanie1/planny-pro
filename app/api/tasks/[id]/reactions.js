// import connectDB from "lib/db"
// import Task from "app/models/Task"
// import { NextResponse } from "next/server"
// import mongoose from "mongoose"
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "app/api/auth/[...nextauth]/route"

// export async function POST(req, { params }) {
//   await connectDB()
//   const { id: taskId, commentId } = params
//   const { emoji } = await req.json()

//   // Get the current user
//   const session = await getServerSession(authOptions)
//   const userId = session?.user?.id

//   if (!userId) {
//     return NextResponse.json({ error: "Authentication required" }, { status: 401 })
//   }

//   if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(commentId)) {
//     return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
//   }

//   try {
//     const task = await Task.findById(taskId)
//     if (!task) {
//       return NextResponse.json({ error: "Task not found" }, { status: 404 })
//     }

//     const comment = task.comments.id(commentId)
//     if (!comment) {
//       return NextResponse.json({ error: "Comment not found" }, { status: 404 })
//     }

//     // Initialize reactions array if it doesn't exist
//     if (!comment.reactions) {
//       comment.reactions = []
//     }

//     // Check if user already reacted with this emoji
//     const existingReactionIndex = comment.reactions.findIndex(
//       (r) => r.emoji === emoji && r.userId.toString() === userId,
//     )

//     if (existingReactionIndex > -1) {
//       // Remove the reaction if it exists
//       comment.reactions.splice(existingReactionIndex, 1)
//     } else {
//       // Add the reaction if it doesn't exist
//       comment.reactions.push({
//         userId: userId,
//         emoji: emoji,
//       })
//     }

//     await task.save()

//     // Group reactions by emoji for the response
//     const groupedReactions = comment.reactions.reduce((acc, reaction) => {
//       if (!acc[reaction.emoji]) {
//         acc[reaction.emoji] = {
//           emoji: reaction.emoji,
//           count: 0,
//           users: [],
//         }
//       }
//       acc[reaction.emoji].count++
//       acc[reaction.emoji].users.push(reaction.userId.toString())
//       return acc
//     }, {})

//     return NextResponse.json({
//       message: "Reaction toggled successfully",
//       reactions: Object.values(groupedReactions),
//     })
//   } catch (err) {
//     console.error("Error toggling reaction:", err)
//     return NextResponse.json({ error: "Server error" }, { status: 500 })
//   }
// }
