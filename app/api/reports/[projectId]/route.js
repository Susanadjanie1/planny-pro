import { NextResponse } from "next/server";
import connectDB from "lib/db";
import Project from "app/models/Project";
import Task from "app/models/Task";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { projectId } = params;

    const project = await Project.findById(projectId).populate(
      "teamMembers",
      "email"
    );
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    const tasks = await Task.find({ project: projectId });

    let csv = `Project Title:,${project.title}\n`;
    csv += `Description:,${project.description}\n`;
    csv += `Status:,${project.status}\n`;
    csv += `Created By:,${project.createdBy}\n`;
    csv += `Team Members:,${project.teamMembers
      .map((m) => m.email)
      .join(", ")}\n\n`;

    csv += "Task Title,Description,Status,Due Date,Assigned To\n";

    tasks.forEach((task) => {
      csv += `"${task.title}","${task.description}","${task.status}",${
        task.dueDate || ""
      },"${task.assignedTo?.join(", ") || ""}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="project-${projectId}-report.csv"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
