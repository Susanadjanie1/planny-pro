import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from 'lib/db';
import Project from 'app/models/Project';
import User from 'app/models/User'; // ✅ Register User model

export async function GET() {
  await connectDB();
  const projects = await Project.find({}).populate('teamMembers'); // ✅ will now work
  return NextResponse.json(projects);
}

export async function POST(req) {
  await connectDB();

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const project = await Project.create({
      title,
      description,
      createdBy: decoded.userId,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
