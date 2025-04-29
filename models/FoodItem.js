import mongoose from "mongoose"

const FoodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["veg", "nonveg", "beverage", "dessert"],
    },
    image: {
      type: String,
      default: "/placeholder.svg?height=300&width=300",
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.FoodItem || mongoose.model("FoodItem", FoodItemSchema)
