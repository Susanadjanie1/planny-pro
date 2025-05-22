import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db"
import Project from "../../models/Project";
import User from "../../models/User"
import { ROLES } from "../../../lib/constants"
import mongoose from "mongoose";

// Helper to extract user from JWT
const getUserFromRequest = async (req) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT verify failed:", err);
    return null;
  }
};

// GET /api/projects
export async function GET(req) {
  try {
    await connectDB();

    const user = await getUserFromRequest(req);
    if (!user) {
      console.log("User not authenticated");
      return NextResponse.json({ projects: [] }, { status: 200 });
    }

    const filter = {};

    if (user.role === ROLES.ADMIN) {
      filter.createdBy = new mongoose.Types.ObjectId(user.userId);
    } else if (user.role === ROLES.MANAGER || user.role === ROLES.MEMBER) {
      filter.$or = [
        { teamMembers: new mongoose.Types.ObjectId(user.userId) },
        { createdBy: new mongoose.Types.ObjectId(user.userId) },
      ];
    }

    const projects = await Project.find(filter)
      .populate("teamMembers")
      .sort({ createdAt: -1 });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET projects error:", error);
    return NextResponse.json(
      { projects: [], error: "Failed to fetch projects" },
      { status: 200 }
    );
  }
}

// POST /api/projects
export async function POST(req) {
  await connectDB();

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { title, description, startDate, endDate, teamMembers = [] } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    // Ensure creator is part of teamMembers
    const memberSet = new Set(teamMembers.map(id => id.toString()));
    memberSet.add(decoded.userId.toString());

    const uniqueMemberIds = Array.from(memberSet).map(id => new mongoose.Types.ObjectId(id));

    // ✅ Validate that all user IDs exist in the User collection
    const existingUsers = await User.find({ _id: { $in: uniqueMemberIds } }).select("_id");
    const validUserIds = new Set(existingUsers.map(user => user._id.toString()));

    const finalTeamMembers = uniqueMemberIds.filter(id => validUserIds.has(id.toString()));

    if (finalTeamMembers.length === 0) {
      return NextResponse.json({ error: "No valid team members found." }, { status: 400 });
    }

    const project = await Project.create({
      title,
      description,
      startDate,
      endDate,
      createdBy: decoded.userId,
      teamMembers: finalTeamMembers,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST project error:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
