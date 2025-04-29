"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Chatbot } from "@/components/chatbot/chatbot"

interface OrderItem {
  foodItem: {
    _id: string
    name: string
    price: number
  }
  quantity: number
  specialInstructions?: string
}

interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  totalPrice: number
  discountedPrice?: number
  status: "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled"
  createdAt: string
  paymentStatus?: string
  paymentId?: string
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/orders")

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await response.json()
        console.log("Orders data:", data)

        // Check if data is an array directly or if it's in a property
        if (Array.isArray(data)) {
          setOrders(data)
        } else if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders)
        } else {
          console.error("Unexpected orders data format:", data)
          setOrders([])
          setError("Unexpected data format received from server")
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError(error.message || "Failed to fetch orders")
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchOrders()
    }
  }, [session])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Preparing":
        return "bg-blue-100 text-blue-800"
      case "Ready":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <div className="text-center py-8">Loading orders...</div>
        </main>
        <Chatbot />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <div className="text-center py-8 text-red-500">
            Error loading orders: {error}
            <div className="mt-4">
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </main>
        <Chatbot />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">You haven&apos;t placed any orders yet</h2>
            <Link href="/">
              <Button>Browse Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Order #{order.orderNumber}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Items</h3>
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>
                              {item.quantity} × {item.foodItem.name}
                              {item.specialInstructions && (
                                <span className="block text-sm text-muted-foreground">
                                  Note: {item.specialInstructions}
                                </span>
                              )}
                            </span>
                            <span>₹{(item.foodItem.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total</span>
                      <span>₹{(order.discountedPrice || order.totalPrice).toFixed(2)}</span>
                    </div>

                    {order.paymentStatus && (
                      <div className="flex justify-between text-sm">
                        <span>Payment Status</span>
                        <Badge variant={order.paymentStatus === "paid" ? "success" : "outline"}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </div>

                    <Link href={`/orders/${order._id}`}>
                      <Button variant="outline" className="w-full">
                        View Order Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Chatbot />
    </div>
  )
}
