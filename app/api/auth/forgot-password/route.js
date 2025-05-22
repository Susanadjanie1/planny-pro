import { NextResponse } from "next/server"
import connectDB from "lib/db"
import User from "app/models/User"
import crypto from "crypto"
import { sendPasswordResetEmail } from "lib/email"

export async function POST(req) {
  try {
    await connectDB()
    const { email } = await req.json()

    // Find user by email
    const user = await User.findOne({ email })

    // Even if user doesn't exist, we return success for security reasons
    // This prevents user enumeration attacks
    if (!user) {
      return NextResponse.json({ message: "Password reset email sent if account exists" }, { status: 200 })
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex")

    // Hash the token for security
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    // Save the hashed token to the user document
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour from now
    await user.save()

    // Send the email with the reset token
    await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json({ message: "Password reset email sent" }, { status: 200 })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
