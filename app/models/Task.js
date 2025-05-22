import mongoose from "mongoose";

// Reaction schema for comments
const ReactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emoji: String,
  },
  { _id: false }
);

// Comment schema
const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  timestamp: { type: Date, default: Date.now },
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  reactions: [ReactionSchema],
  edited: { type: Boolean, default: false },
  editedAt: Date,
});

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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [CommentSchema],
    timeLogs: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        hours: { type: Number, required: true },
        email: String, // fixed typo here
        date: { type: Date, default: Date.now },
      },
    ],
    dueDate: Date,
  },
  {
    timestamps: true,
  }
);

// During development, delete existing model to prevent recompilation errors
if (process.env.NODE_ENV !== "production") {
  if (mongoose.models.Task) {
    delete mongoose.models.Task;
  }
}

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
