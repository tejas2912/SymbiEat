import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db"
import Order from "@/models/Order"
import FoodItem from "@/models/FoodItem"
import User from "@/models/User"
import { v4 as uuidv4 } from "uuid"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { items, total, paymentId, paymentOrderId } = await request.json()

    if (!items || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    // Get user details
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify all food items exist and are available
    const foodItemIds = items.map((item) => item.foodItem)
    const foodItems = await FoodItem.find({
      _id: { $in: foodItemIds },
      available: true,
    })

    if (foodItems.length !== foodItemIds.length) {
      return NextResponse.json({ error: "Some items are not available" }, { status: 400 })
    }

    // Create a unique order ID
    const orderNumber = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`

    // Create the order
    const order = await Order.create({
      orderNumber,
      items: items.map((item) => ({
        foodItem: item.foodItem,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions,
      })),
      totalPrice: total,
      user: user._id,
      userName: user.name,
      paymentId,
      paymentOrderId,
      paymentStatus: paymentId ? "paid" : "pending",
    })

    await order.populate("items.foodItem")

    return NextResponse.json({
      message: "Order placed successfully",
      order,
      orderId: orderNumber,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await connectDB()

    // Get user details
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    const query = {}

    // If admin and userId is provided, filter by that user
    if (session.user.role === "admin" && userId && userId !== "all") {
      query.user = userId
    } else if (session.user.role !== "admin") {
      // Regular users can only see their own orders
      query.user = user._id
    }

    // Filter by status if provided
    if (status && status !== "all") {
      query.status = status
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.foodItem")
      .sort({ createdAt: -1 })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
