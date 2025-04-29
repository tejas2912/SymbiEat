"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, CreditCard } from "lucide-react"
import { formatDate } from "@/lib/utils"
import ClientLayout from "@/components/client-layout"

export default function OrderDetailsPage({ params }) {
  const { id } = params
  const router = useRouter()
  const { data: session, status } = useSession()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/orders")
      return
    }

    if (status === "authenticated") {
      fetchOrderDetails()
    }
  }, [status, id, router])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch order details")
      }
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error("Error fetching order details:", error)
      setError("Failed to load order details")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Preparing":
        return "bg-blue-100 text-blue-800"
      case "Ready":
        return "bg-purple-100 text-purple-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto flex min-h-screen items-center justify-center">
          <p>Loading order details...</p>
        </div>
      </ClientLayout>
    )
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="container mx-auto flex min-h-screen items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </ClientLayout>
    )
  }

  if (!order) {
    return (
      <ClientLayout>
        <div className="container mx-auto flex min-h-screen items-center justify-center">
          <p>Order not found</p>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span>{order.orderNumber || order._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span>₹{order.totalPrice.toFixed(2)}</span>
                </div>
                {order.paymentId && (
                  <div className="flex justify-between">
                    <span className="font-medium">Payment Status:</span>
                    <Badge className={getPaymentStatusColor(order.paymentStatus || "paid")}>
                      {order.paymentStatus || "Paid"}
                    </Badge>
                  </div>
                )}
                {order.paymentId && (
                  <div className="flex justify-between">
                    <span className="font-medium">Payment ID:</span>
                    <span className="text-sm">{order.paymentId}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium">Address:</span>
                  <p className="mt-1">{order.address}</p>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <p className="mt-1">{order.phone}</p>
                </div>
                {order.additionalNotes && (
                  <div>
                    <span className="font-medium">Additional Notes:</span>
                    <p className="mt-1">{order.additionalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {order.items.map((item, index) => (
                    <li key={index} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">
                            {item.quantity} × {item.foodItem.name}
                          </p>
                          <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</p>
                          {item.specialInstructions && (
                            <p className="text-xs italic text-gray-500">Note: {item.specialInstructions}</p>
                          )}
                        </div>
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Current Status</p>
                      <p className="text-sm text-muted-foreground">
                        {order.status === "Pending" && "Your order has been received and is being processed."}
                        {order.status === "Preparing" && "Your order is being prepared in the kitchen."}
                        {order.status === "Ready" && "Your order is ready for pickup/delivery."}
                        {order.status === "Completed" && "Your order has been completed."}
                      </p>
                    </div>
                  </div>

                  {order.paymentId && (
                    <div className="mt-4 flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Payment Information</p>
                        <p className="text-sm text-muted-foreground">
                          Payment was successfully processed via Razorpay.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}
