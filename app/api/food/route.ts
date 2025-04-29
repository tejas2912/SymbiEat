import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import FoodItem from "@/models/FoodItem"

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = {}
    if (category && category !== "all") {
      query = { category }
    }

    const foodItems = await FoodItem.find(query)
    return NextResponse.json(foodItems)
  } catch (error) {
    console.error("Error fetching food items:", error)
    return NextResponse.json({ error: "Failed to fetch food items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()

    const data = await request.json()
    const foodItem = await FoodItem.create(data)

    return NextResponse.json(foodItem, { status: 201 })
  } catch (error) {
    console.error("Error creating food item:", error)
    return NextResponse.json({ error: "Failed to create food item" }, { status: 500 })
  }
}
