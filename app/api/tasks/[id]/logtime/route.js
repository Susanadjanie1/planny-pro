import connectDB from 'lib/db';
import Task from 'app/models/Task';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  await connectDB();
  const { id } = params;
  const { userId, hours } = await req.json();

  try {
    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    task.timeLogs.push({ userId, hours });
    await task.save();

    return NextResponse.json({ message: 'Time logged successfully', task });
  } catch (err) {
    console.error('Error logging time:', err);
    return NextResponse.json({ error: 'Failed to log time' }, { status: 500 });
  }
}
