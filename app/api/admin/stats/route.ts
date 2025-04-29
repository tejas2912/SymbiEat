import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Order from "@/models/Order"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()

    // Get today's date (start and end)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all orders
    const allOrders = await Order.find().sort({ createdAt: -1 })

    // Get today's orders
    const todayOrders = allOrders.filter(
      (order) => new Date(order.createdAt) >= today && new Date(order.createdAt) < tomorrow,
    )

    // Get pending orders
    const pendingOrders = allOrders.filter((order) => order.status === "Pending").length

    // Calculate total revenue
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.discountedPrice || order.totalPrice), 0)

    // Calculate today's revenue
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.discountedPrice || order.totalPrice), 0)

    // Count orders by status
    const ordersByStatus = {
      Pending: allOrders.filter((order) => order.status === "Pending").length,
      Preparing: allOrders.filter((order) => order.status === "Preparing").length,
      Ready: allOrders.filter((order) => order.status === "Ready").length,
      Completed: allOrders.filter((order) => order.status === "Completed").length,
    }

    // Get recent orders (last 5)
    const recentOrders = allOrders.slice(0, 5).map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      userName: order.userName,
      status: order.status,
      totalPrice: order.totalPrice,
      discountedPrice: order.discountedPrice,
      createdAt: order.createdAt,
    }))

    // Get orders by day for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      return date
    }).reverse()

    const ordersByDay = last7Days.map((date) => {
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const dayOrders = allOrders.filter(
        (order) => new Date(order.createdAt) >= date && new Date(order.createdAt) < nextDay,
      )

      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.discountedPrice || order.totalPrice), 0)

      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        orders: dayOrders.length,
        revenue: dayRevenue,
      }
    })

    return NextResponse.json({
      totalOrders: allOrders.length,
      totalRevenue,
      pendingOrders,
      todayOrders: todayOrders.length,
      todayRevenue,
      ordersByStatus,
      recentOrders,
      ordersByDay,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
