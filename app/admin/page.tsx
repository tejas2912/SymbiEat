"use client"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { motion } from "framer-motion"

export default function AdminPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-[hsl(var(--admin-text))/0.7] mt-1">
          Welcome to the SimbiEat admin panel. Manage your restaurant from here.
        </p>
      </div>

      <AdminDashboard />
    </motion.div>
  )
}
