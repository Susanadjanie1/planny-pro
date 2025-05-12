import connectDB from 'lib/db';
import Task from 'app/models/Task';
import User from 'app/models/User';
import jwt from 'jsonwebtoken';
import { ROLES } from 'lib/constants';
import mongoose from 'mongoose';

const getUserFromRequest = async (req) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT verify failed:", err);
    return null;
  }
};

export async function GET(req) {
  try {
    await connectDB();
    const user = await getUserFromRequest(req);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    let filter = {};
    console.log('Filtering tasks for member:', filter);

    if (user.role === ROLES.MEMBER) {
      filter.assignedTo = new mongoose.Types.ObjectId(user.userId);
    } else if ([ROLES.MANAGER, ROLES.ADMIN].includes(user.role)) {
      if (projectId) {
        filter.projectId = projectId;
      }
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify({ tasks }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("GET /api/tasks failed:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await getUserFromRequest(req);

    if (!user || ![ROLES.ADMIN, ROLES.MANAGER].includes(user.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      projectId,
    } = await req.json();

    const assignedUserIds = await User.find({ email: { $in: assignedTo } })
      .then(users => users.map(user => user._id.toString()));

    const newTask = new Task({
      title,
      description,
      assignedTo: assignedUserIds[0], // Assuming one assignee for now
      priority,
      dueDate,
      projectId,
    });

    await newTask.save();

    return new Response(JSON.stringify(newTask), { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks failed:", error);
    return new Response(JSON.stringify({ error: 'Failed to create task' }), {
      status: 500,
    });
  }
}
