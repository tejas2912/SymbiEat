import { NextResponse } from "next/server"
import crypto from "crypto"
import connectDB from "@/lib/db"
import Order from "@/models/Order"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-razorpay-signature") || ""

    console.log("Received webhook from Razorpay")

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_SECRET
    if (!secret) {
      console.error("Webhook secret not configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Parse the webhook payload
    const payload = JSON.parse(body)
    console.log("Webhook payload:", JSON.stringify(payload, null, 2))

    // Handle different event types
    const event = payload.event

    if (event === "payment.authorized" || event === "payment.captured") {
      const paymentId = payload.payload.payment.entity.id
      const orderId = payload.payload.payment.entity.order_id

      console.log(`Payment ${event} for order ${orderId}, payment ID ${paymentId}`)

      // Update order status in database
      await connectDB()
      const order = await Order.findOne({ paymentOrderId: orderId })

      if (order) {
        order.paymentStatus = "paid"
        await order.save()
        console.log(`Updated order ${order._id} payment status to paid`)
      } else {
        console.log(`Order not found for payment order ID ${orderId}`)
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// Disable body parsing as we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}
