import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import FoodItem from "@/models/FoodItem"

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = {}
    if (category && category !== "all") {
      query = { category }
    }

    const foodItems = await FoodItem.find(query).sort({ name: 1 })
    return NextResponse.json(foodItems)
  } catch (error) {
    console.error("Error fetching food items:", error)
    return NextResponse.json({ error: "Failed to fetch food items" }, { status: 500 })
  }
}
