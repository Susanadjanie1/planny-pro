// app/api/users/route.js

import { NextResponse } from 'next/server';
import connectDB from 'lib/db';
import User from 'app/models/User';
import { verifyToken } from 'lib/auth';
import { ROLES } from 'lib/constants';

export async function GET(req) {
  try {
    const user = await verifyToken(req);

    if (!user || ![ROLES.ADMIN, ROLES.MANAGER].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const users = await User.find({
      role: { $in: [ROLES.MANAGER, ROLES.MEMBER] },
    }).select('email name role');

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
