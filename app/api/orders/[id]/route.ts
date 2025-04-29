import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/models/Order"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const order = await Order.findById(params.id).populate("items.foodItem")

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const data = await request.json()
    const order = await Order.findByIdAndUpdate(params.id, data, { new: true })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
