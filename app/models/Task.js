import mongoose from "mongoose"

// Add reaction schema for comments
const ReactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emoji: String,
  },
  { _id: false },
)

// Enhanced comment schema
const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  timestamp: { type: Date, default: Date.now },
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null }, // For threaded comments
  reactions: [ReactionSchema], // For emoji reactions
  edited: { type: Boolean, default: false }, // Track if comment was edited
  editedAt: Date, // When the comment was edited
})

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [CommentSchema], // Using the enhanced comment schema
    timeLogs: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        hours: Number,
        date: { type: Date, default: Date.now },
      },
    ],
    dueDate: Date,
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Task || mongoose.model("Task", TaskSchema)
