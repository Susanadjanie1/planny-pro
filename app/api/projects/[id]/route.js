import connectDB from 'lib/db';
import Project from 'app/models/Project';
import { NextResponse } from 'next/server';

export async function GET(req, context) {
  await connectDB();
  const { id } = context.params;

  try {
    const project = await Project.findById(id).populate('tasks teamMembers');
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(req, context) {
  await connectDB();
  const { id } = context.params;
  const data = await req.json();

  try {
    const updatedProject = await Project.findByIdAndUpdate(id, data, { new: true });
    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function PATCH(req, context) {
  await connectDB();
  const { id } = context.params;
  const data = await req.json();

  try {
    const updatedProject = await Project.findByIdAndUpdate(id, data, { new: true });
    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  await connectDB();
  const { id } = context.params;

  try {
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
