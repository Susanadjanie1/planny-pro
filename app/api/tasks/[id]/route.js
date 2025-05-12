import connectDB from 'lib/db';
import Task from 'app/models/Task';
import User from 'app/models/User';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  await connectDB();

  try {
    const { id } = params;
    const task = await Task.findById(id).populate('assignedTo projectId');
    return task
      ? NextResponse.json(task)
      : NextResponse.json({ error: 'Task not found' }, { status: 404 });
  } catch (err) {
    console.error('GET Task Error:', err);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { id } = params;
    const updates = await req.json();

    // Handle assignedTo if passed as email(s)
    if (updates.assignedTo && Array.isArray(updates.assignedTo)) {
      const users = await User.find({ email: { $in: updates.assignedTo } }, '_id');
      updates.assignedTo = users.map(u => u._id);
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
    return updatedTask
      ? NextResponse.json(updatedTask)
      : NextResponse.json({ error: 'Task not found' }, { status: 404 });
  } catch (err) {
    console.error('PUT Task Error:', err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();

  try {
    const { id } = params;
    const deleted = await Task.findByIdAndDelete(id);
    return deleted
      ? NextResponse.json({ message: 'Deleted successfully' })
      : NextResponse.json({ error: 'Task not found' }, { status: 404 });
  } catch (err) {
    console.error('DELETE Task Error:', err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
