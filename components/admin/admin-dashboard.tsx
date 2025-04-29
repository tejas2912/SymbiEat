"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Loader2, TrendingUp, DollarSign, ShoppingBag, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface OrderStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  todayOrders: number
  todayRevenue: number
  ordersByStatus: {
    Pending: number
    Preparing: number
    Ready: number
    Completed: number
  }
  recentOrders: {
    _id: string
    orderNumber: string
    userName: string
    status: string
    totalPrice: number
    discountedPrice?: number
    createdAt: string
  }[]
  ordersByDay: {
    date: string
    orders: number
    revenue: number
  }[]
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]

export function AdminDashboard() {
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-primary))]" />
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-8">Failed to load dashboard data</div>
  }

  // Prepare data for pie chart
  const pieData = Object.entries(stats.ordersByStatus).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-[hsl(var(--admin-primary))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
              <p className="text-xs text-[hsl(var(--admin-text))/0.7]">
                {stats.todayOrders > 0 ? `+${stats.todayOrders}` : "No"} orders today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-[hsl(var(--admin-accent))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.todayRevenue.toFixed(2)}</div>
              <p className="text-xs text-[hsl(var(--admin-text))/0.7]">
                {stats.todayRevenue > 0 ? `+₹${stats.todayRevenue.toFixed(2)}` : "No revenue"} today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-[hsl(var(--admin-secondary))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-[hsl(var(--admin-text))/0.7]">{stats.pendingOrders} orders waiting</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-[hsl(var(--admin-text))/0.7]">From {stats.totalOrders} total orders</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))]">
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription className="text-[hsl(var(--admin-text))/0.7]">
                Current distribution of order statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))]">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription className="text-[hsl(var(--admin-text))/0.7]">Last 5 orders placed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.length === 0 ? (
                  <p className="text-center text-[hsl(var(--admin-text))/0.7]">No recent orders</p>
                ) : (
                  stats.recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between border-b border-[hsl(var(--admin-muted))] pb-2"
                    >
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-[hsl(var(--admin-text))/0.7]">{order.userName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(order.discountedPrice || order.totalPrice).toFixed(2)}</p>
                        <p className="text-sm text-[hsl(var(--admin-text))/0.7]">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))]">
          <CardHeader>
            <CardTitle>Orders & Revenue (Last 7 Days)</CardTitle>
            <CardDescription className="text-[hsl(var(--admin-text))/0.7]">
              Daily order count and revenue
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ordersByDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                  <YAxis yAxisId="left" orientation="left" stroke="rgba(255,255,255,0.7)" />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30,30,30,0.9)",
                      border: "none",
                      borderRadius: "4px",
                      color: "white",
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="orders"
                    name="Orders"
                    fill="hsl(var(--admin-primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    name="Revenue (₹)"
                    fill="hsl(var(--admin-accent))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
