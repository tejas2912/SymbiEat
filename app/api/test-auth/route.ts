import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    await connectDB()

    // Find the test user
    const email = "user@simbieat.com"
    const password = "user123"

    console.log(`Testing auth for user: ${email}`)
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`User found: ${user.name}, role: ${user.role}`)
    console.log(`Password hash: ${user.password}`)

    // Test password comparison using both methods
    const directCompare = await bcrypt.compare(password, user.password)
    const modelCompare = await user.comparePassword(password)

    return NextResponse.json({
      userFound: true,
      directPasswordValid: directCompare,
      modelPasswordValid: modelCompare,
      userDetails: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: user.password,
      },
    })
  } catch (error) {
    console.error("Test auth error:", error)
    return NextResponse.json({ error: "Test auth failed", details: error.message }, { status: 500 })
  }
}
