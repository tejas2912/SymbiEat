import mongoose, { Schema, type Document } from "mongoose"

export interface ICoupon extends Document {
  code: string
  discountPercentage: number
  maxDiscount?: number
  minOrderValue?: number
  active: boolean
  expiresAt?: Date
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true },
    maxDiscount: { type: Number },
    minOrderValue: { type: Number },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true },
)

export default mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema)
