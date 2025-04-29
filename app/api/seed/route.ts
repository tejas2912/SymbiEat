import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import FoodItem from "@/models/FoodItem"
import Coupon from "@/models/Coupon"
import User from "@/models/User"

const foodItems = [
  {
    name: "Veg Biryani",
    description: "Fragrant rice cooked with mixed vegetables and aromatic spices",
    price: 120,
    category: "veg",
    image: "https://source.unsplash.com/random/300x300/?biryani",
    available: true,
  },
  {
    name: "Chicken Biryani",
    description: "Fragrant rice cooked with tender chicken pieces and aromatic spices",
    price: 150,
    category: "nonveg",
    image: "https://source.unsplash.com/random/300x300/?chicken-biryani",
    available: true,
  },
  {
    name: "Paneer Butter Masala",
    description: "Cottage cheese cubes in a rich and creamy tomato-based gravy",
    price: 130,
    category: "veg",
    image: "https://source.unsplash.com/random/300x300/?paneer",
    available: true,
  },
  {
    name: "Butter Chicken",
    description: "Tender chicken pieces in a rich and creamy tomato-based gravy",
    price: 160,
    category: "nonveg",
    image: "https://source.unsplash.com/random/300x300/?butter-chicken",
    available: true,
  },
  {
    name: "Masala Dosa",
    description: "Crispy rice crepe filled with spiced potato filling, served with sambar and chutney",
    price: 90,
    category: "veg",
    image: "https://source.unsplash.com/random/300x300/?dosa",
    available: true,
  },
  {
    name: "Veg Fried Rice",
    description: "Stir-fried rice with mixed vegetables and soy sauce",
    price: 100,
    category: "veg",
    image: "https://source.unsplash.com/random/300x300/?fried-rice",
    available: true,
  },
  {
    name: "Chicken Fried Rice",
    description: "Stir-fried rice with chicken pieces and soy sauce",
    price: 120,
    category: "nonveg",
    image: "https://source.unsplash.com/random/300x300/?chicken-fried-rice",
    available: true,
  },
  {
    name: "Veg Noodles",
    description: "Stir-fried noodles with mixed vegetables",
    price: 90,
    category: "veg",
    image: "https://source.unsplash.com/random/300x300/?noodles",
    available: true,
  },
]

const coupons = [
  {
    code: "WELCOME20",
    discountPercentage: 20,
    maxDiscount: 100,
    minOrderValue: 200,
    active: true,
  },
  {
    code: "FLAT50",
    discountPercentage: 10,
    maxDiscount: 50,
    minOrderValue: 300,
    active: true,
  },
]

const users = [
  {
    name: "Admin User",
    email: "admin@simbieat.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Test User",
    email: "user@simbieat.com",
    password: "user123",
    role: "user",
  },
]

export async function GET() {
  try {
    await connectDB()

    // Clear existing data
    await FoodItem.deleteMany({})
    await Coupon.deleteMany({})
    await User.deleteMany({})

    // Insert food items
    await FoodItem.insertMany(foodItems)

    // Insert coupons
    await Coupon.insertMany(coupons)

    // Insert users - let the pre-save hook handle password hashing
    for (const userData of users) {
      console.log(`Creating user: ${userData.email} with role: ${userData.role}`)
      const user = new User(userData)
      await user.save()
    }

    return NextResponse.json({
      message: "Database seeded successfully",
      foodItemsCount: foodItems.length,
      couponsCount: coupons.length,
      usersCount: users.length,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database", details: error.message }, { status: 500 })
  }
}
