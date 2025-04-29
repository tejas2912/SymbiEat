"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, ShoppingBag, Tag, Users, LogOut, ChevronLeft, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Removed Settings from the menu items
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Tag, label: "Food Items", href: "/admin/food-items" },
  { icon: Users, label: "Users", href: "/admin/users" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/auth/login")
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-[hsl(var(--admin-card))] border-r border-[hsl(var(--admin-muted))] md:relative",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        animate={{
          width: collapsed ? "5rem" : "16rem",
          translateX: mobileOpen || window.innerWidth >= 768 ? 0 : "-100%",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 flex items-center justify-between border-b border-[hsl(var(--admin-muted))]">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <span className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-accent))] text-transparent bg-clip-text">
                    SimbiEat Admin
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              className="text-[hsl(var(--admin-text))]"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
            </Button>
          </div>

          {/* Menu items */}
          <div className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-2 px-3">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setMobileOpen(false)}>
                    <div
                      className={cn(
                        "flex items-center px-3 py-3 rounded-md transition-colors",
                        isActive(item.href)
                          ? "bg-[hsl(var(--admin-primary))] text-white"
                          : "text-[hsl(var(--admin-text))/0.8] hover:bg-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))]",
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="ml-3 whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logout button */}
          <div className="p-4 border-t border-[hsl(var(--admin-muted))]">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-[hsl(var(--admin-text))/0.8] hover:bg-[hsl(var(--admin-muted))] hover:text-[hsl(var(--admin-text))]",
                collapsed && "justify-center",
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
