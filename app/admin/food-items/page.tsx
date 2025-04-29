"use client"

import { AdminFoodItems } from "@/components/admin/admin-food-items"

export default function AdminFoodItemsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Food Items Management</h1>
        <p className="text-[hsl(var(--admin-text))/0.7] mt-1">Manage your menu items from here</p>
      </div>

      <AdminFoodItems />
    </div>
  )
}
