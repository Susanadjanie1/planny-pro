// app/api/auth/login/route.js

import { NextResponse } from 'next/server';
import connectDB from 'lib/db';
import User from 'app/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email }).select('+password'); // Ensure password is fetched
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
console.log("LOGIN DEBUG >>>", {
  user,
  userPassword: user?.password,
  passwordInput: password
});

    console.log("Fetched user:", user);


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    const res = NextResponse.json({ message: 'Login successful', role: user.role ,token});
    res.headers.set('Set-Cookie', cookie);
    return res;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
