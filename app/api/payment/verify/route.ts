import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import crypto from "crypto"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification parameters" }, { status: 400 })
    }

    // Verify signature
    const secret = process.env.RAZORPAY_SECRET
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment", details: error.message }, { status: 500 })
  }
}
