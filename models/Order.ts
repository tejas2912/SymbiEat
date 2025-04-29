import mongoose, { Schema, type Document } from "mongoose"

interface OrderItem {
  foodItem: mongoose.Types.ObjectId
  quantity: number
  specialInstructions?: string
  price: number
}

export interface IOrder extends Document {
  orderNumber: string
  items: OrderItem[]
  totalPrice: number
  discountedPrice?: number
  couponCode?: string
  status: "Pending" | "Preparing" | "Ready" | "Completed"
  user?: mongoose.Types.ObjectId
  userName: string
  deliveryInstructions?: string
  paymentId?: string
  paymentOrderId?: string
  paymentStatus?: "paid" | "failed" | "pending"
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        foodItem: { type: Schema.Types.ObjectId, ref: "FoodItem", required: true },
        quantity: { type: Number, required: true },
        specialInstructions: { type: String },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    discountedPrice: { type: Number },
    couponCode: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Completed"],
      default: "Pending",
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true },
    deliveryInstructions: { type: String },
    paymentId: { type: String },
    paymentOrderId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["paid", "failed", "pending"],
      default: "pending",
    },
  },
  { timestamps: true },
)

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
