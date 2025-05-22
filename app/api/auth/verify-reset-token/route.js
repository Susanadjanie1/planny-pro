import { NextResponse } from "next/server"
import connectDB from "../../../../lib/db"
import User from "../../../models/User"
import crypto from "crypto"

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 })
    }

    await connectDB()

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

    return NextResponse.json({ message: "Token is valid" }, { status: 200 })
  } catch (error) {
    console.error("Verify token error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
