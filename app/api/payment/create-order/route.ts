import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Razorpay from "razorpay"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    })

    // Create order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto-capture payment
    })

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Failed to create payment order", details: error.message }, { status: 500 })
  }
}
