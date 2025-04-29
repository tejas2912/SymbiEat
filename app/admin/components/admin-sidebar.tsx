"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Utensils, ShoppingBag, Users } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Food Items",
    href: "/admin/food-items",
    icon: Utensils,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col border-r bg-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}
