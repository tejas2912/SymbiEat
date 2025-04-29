"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, Filter, Eye, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface OrderItem {
  foodItem: {
    _id: string
    name: string
    price: number
  }
  quantity: number
  specialInstructions?: string
  price: number
}

interface Order {
  _id: string
  orderNumber: string
  userName: string
  items: OrderItem[]
  totalPrice: number
  discountedPrice?: number
  couponCode?: string
  status: "Pending" | "Preparing" | "Ready" | "Completed"
  createdAt: string
  deliveryInstructions?: string
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    // Filter orders based on status and search query
    let filtered = [...orders]

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) => order.orderNumber.toLowerCase().includes(query) || order.userName.toLowerCase().includes(query),
      )
    }

    setFilteredOrders(filtered)
  }, [statusFilter, searchQuery, orders])

  async function fetchOrders() {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/orders?userId=all")
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }
      const data = await response.json()
      setOrders(data)
      setFilteredOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === orderId ? { ...order, status: newStatus as any } : order)),
      )

      // Update selected order if it's the one being viewed
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status")
    }
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Preparing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Ready":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-primary))]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text))/0.5]" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
            />
          </div>

          <div className="flex-shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Preparing">Preparing</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={fetchOrders}
          disabled={isRefreshing}
          className="w-full md:w-auto border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Orders"}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-md border border-[hsl(var(--admin-muted))] overflow-hidden"
      >
        <Table className="responsive-table">
          <TableHeader>
            <TableRow className="bg-[hsl(var(--admin-card))] hover:bg-[hsl(var(--admin-card))]">
              <TableHead className="text-[hsl(var(--admin-text))]">Order #</TableHead>
              <TableHead className="text-[hsl(var(--admin-text))]">Customer</TableHead>
              <TableHead className="text-[hsl(var(--admin-text))]">Date</TableHead>
              <TableHead className="text-[hsl(var(--admin-text))]">Amount</TableHead>
              <TableHead className="text-[hsl(var(--admin-text))]">Status</TableHead>
              <TableHead className="text-[hsl(var(--admin-text))]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow className="bg-[hsl(var(--admin-card))] hover:bg-[hsl(var(--admin-muted))]">
                <TableCell colSpan={6} className="text-center py-4 text-[hsl(var(--admin-text))]">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id} className="bg-[hsl(var(--admin-card))] hover:bg-[hsl(var(--admin-muted))]">
                  <TableCell className="font-medium text-[hsl(var(--admin-text))]" data-label="Order #">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell className="text-[hsl(var(--admin-text))]" data-label="Customer">
                    {order.userName}
                  </TableCell>
                  <TableCell className="text-[hsl(var(--admin-text))]" data-label="Date">
                    {new Date(order.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-[hsl(var(--admin-text))]" data-label="Amount">
                    ₹{(order.discountedPrice || order.totalPrice).toFixed(2)}
                  </TableCell>
                  <TableCell data-label="Status">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell data-label="Actions">
                    <div className="flex items-center gap-2">
                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) => handleStatusChange(order._id, value)}
                      >
                        <SelectTrigger className="w-32 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Preparing">Preparing</SelectItem>
                          <SelectItem value="Ready">Ready</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewOrderDetails(order)}
                        className="border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedOrder && (
          <DialogContent className="max-w-3xl bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Order #{selectedOrder.orderNumber}</span>
                <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
              </DialogTitle>
              <DialogDescription className="text-[hsl(var(--admin-text))/0.7]">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()} by {selectedOrder.userName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <h3 className="font-semibold">Order Items</h3>
              <ul className="divide-y divide-[hsl(var(--admin-muted))]">
                {selectedOrder.items.map((item, index) => (
                  <li key={index} className="py-2">
                    <div className="flex justify-between">
                      <div>
                        <p>
                          {item.quantity} × {item.foodItem.name}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-sm text-[hsl(var(--admin-text))/0.7]">Note: {item.specialInstructions}</p>
                        )}
                      </div>
                      <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {selectedOrder.deliveryInstructions && (
                <div>
                  <h3 className="font-semibold">Delivery Instructions</h3>
                  <p className="bg-[hsl(var(--admin-muted))] p-2 rounded mt-1">{selectedOrder.deliveryInstructions}</p>
                </div>
              )}

              <div className="pt-4 border-t border-[hsl(var(--admin-muted))] space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.totalPrice.toFixed(2)}</span>
                </div>

                {selectedOrder.couponCode && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount ({selectedOrder.couponCode})</span>
                    <span>-₹{(selectedOrder.totalPrice - (selectedOrder.discountedPrice || 0)).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{(selectedOrder.discountedPrice || selectedOrder.totalPrice).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[hsl(var(--admin-muted))]">
                <h3 className="font-semibold mb-2">Update Status</h3>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusChange(selectedOrder._id, value)}
                >
                  <SelectTrigger className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]">
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Preparing">Preparing</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
