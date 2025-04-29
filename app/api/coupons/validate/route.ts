import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Coupon from "@/models/Coupon"

export async function POST(request: Request) {
  try {
    await connectDB()

    const { code, orderTotal } = await request.json()

    const coupon = await Coupon.findOne({
      code,
      active: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    })

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Invalid or expired coupon code" }, { status: 400 })
    }

    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
        },
        { status: 400 },
      )
    }

    const discount = (orderTotal * coupon.discountPercentage) / 100
    const finalDiscount = coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount
    const discountedTotal = orderTotal - finalDiscount

    return NextResponse.json({
      valid: true,
      discount: finalDiscount,
      discountedTotal,
      message: `Coupon applied! You saved ₹${finalDiscount.toFixed(2)}`,
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
