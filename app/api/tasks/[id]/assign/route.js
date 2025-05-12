// app/api/tasks/[id]/assign/route.js

import connectDB from 'lib/db';
import Task from 'app/models/Task';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { userIds } = await req.json(); // Expecting array of user IDs

    const updatedTask = await Task.findByIdAndUpdate(
      params.id,
      { assignedTo: userIds },
      { new: true }
    );

    return updatedTask
      ? NextResponse.json(updatedTask)
      : NextResponse.json({ error: 'Task not found' }, { status: 404 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign users' }, { status: 500 });
  }
}
