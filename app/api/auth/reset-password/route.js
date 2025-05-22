import { NextResponse } from "next/server"
import connectDB from "lib/db"
import User from "app/models/User"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(req) {
  try {
    await connectDB()
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
    }

    // Hash the token to compare with the stored one
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find user with the token and check if it's expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Update user's password and clear reset token fields
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return NextResponse.json({ message: "Password has been reset successfully" }, { status: 200 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
