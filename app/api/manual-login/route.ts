import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { sign } from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Create a simple token for testing
    const token = sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET || "test-secret",
      { expiresIn: "1h" },
    )

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Manual login error:", error)
    return NextResponse.json({ error: "Login failed", details: error.message }, { status: 500 })
  }
}
