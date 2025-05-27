import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import { ObjectId } from "mongodb";
import Task from "../../../../models/Task";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";

export async function POST(request, context) {
  try {
    const { id } = context.params;

    const body = await request.json();
    const { userId, hours } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const parsedHours = Number(hours);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      return NextResponse.json(
        { error: "Invalid time value" },
        { status: 400 }
      );
    }

    // Validate user exists and get their email
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const timeLog = {
      userId: new ObjectId(userId),
      hours: parsedHours,
      date: new Date(),
      email: user.email, // Add the user's email to the time log
    };

    // Add the timeLog to the task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $push: { timeLogs: timeLog } },
      { new: true }
    ).populate({
      path: "timeLogs.userId",
      select: "email",
    });

    if (!updatedTask) {
      return NextResponse.json(
        { error: "Task not found after update" },
        { status: 404 }
      );
    }

    // Get the last timeLog added (the one we just pushed)
    const lastTimeLog = updatedTask.timeLogs[updatedTask.timeLogs.length - 1];

    // Return last timeLog with user email
    return NextResponse.json({
      success: true,
      timeLog: {
        _id: lastTimeLog._id.toString(),
        hours: lastTimeLog.hours,
        date: lastTimeLog.date.toISOString(),
        userId: lastTimeLog.userId._id.toString(),
        email: user.email, // Use the user's email directly
      },
    });
  } catch (error) {
    console.error("Error logging time:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
