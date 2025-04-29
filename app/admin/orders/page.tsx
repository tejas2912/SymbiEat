"use client"
import { AdminOrders } from "@/components/admin/admin-orders"
import { motion } from "framer-motion"

export default function AdminOrdersPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-[hsl(var(--admin-text))/0.7] mt-1">View and manage all customer orders from here.</p>
      </div>

      <AdminOrders />
    </motion.div>
  )
}
