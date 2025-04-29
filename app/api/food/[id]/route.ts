import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import FoodItem from "@/models/FoodItem"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const foodItem = await FoodItem.findById(params.id)

    if (!foodItem) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 })
    }

    return NextResponse.json(foodItem)
  } catch (error) {
    console.error("Error fetching food item:", error)
    return NextResponse.json({ error: "Failed to fetch food item" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()

    const data = await request.json()
    const foodItem = await FoodItem.findByIdAndUpdate(params.id, data, { new: true })

    if (!foodItem) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 })
    }

    return NextResponse.json(foodItem)
  } catch (error) {
    console.error("Error updating food item:", error)
    return NextResponse.json({ error: "Failed to update food item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectDB()

    const foodItem = await FoodItem.findByIdAndDelete(params.id)

    if (!foodItem) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Food item deleted successfully" })
  } catch (error) {
    console.error("Error deleting food item:", error)
    return NextResponse.json({ error: "Failed to delete food item" }, { status: 500 })
  }
}
