import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Order from "@/models/Order"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()

    // Get all users
    const users = await User.find().select("-password").sort({ createdAt: -1 })

    // Get order counts and total spent for each user
    const userStats = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
        },
      },
    ])

    // Create a map of user stats
    const userStatsMap = userStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = {
        orderCount: stat.orderCount,
        totalSpent: stat.totalSpent,
      }
      return acc
    }, {})

    // Combine user data with stats
    const usersWithStats = users.map((user) => {
      const userObj = user.toObject()
      const stats = userStatsMap[userObj._id.toString()] || {
        orderCount: 0,
        totalSpent: 0,
      }
      return {
        ...userObj,
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
      }
    })

    return NextResponse.json(usersWithStats)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
