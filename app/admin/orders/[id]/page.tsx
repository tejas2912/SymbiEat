"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, MapPin, Phone, Clock, CreditCard } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function AdminOrderDetailsPage({ params }) {
  const { id } = params
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`)
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

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.status) return

    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      const updatedOrder = await response.json()
      setOrder(updatedOrder)
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status")
    } finally {
      setUpdatingStatus(false)
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
      <div className="flex h-full items-center justify-center">
        <p>Loading order details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Order not found</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">Order Status:</p>
          <Select value={order.status} onValueChange={handleStatusChange} disabled={updatingStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Preparing">Preparing</SelectItem>
              <SelectItem value="Ready">Ready</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.user?.name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{order.user?.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">{order.address}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground">{order.phone}</p>
                </div>
              </div>
              {order.additionalNotes && (
                <div>
                  <p className="font-medium">Additional Notes</p>
                  <p className="text-sm text-muted-foreground">{order.additionalNotes}</p>
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
                          {item.foodItem.name} x {item.quantity}
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
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  {order.status !== "Pending" && (
                    <div className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Status Updated</p>
                        <p className="text-sm text-muted-foreground">{order.status}</p>
                      </div>
                    </div>
                  )}
                  {order.paymentId && (
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Payment Received</p>
                        <p className="text-sm text-muted-foreground">Payment ID: {order.paymentId}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
