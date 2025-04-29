"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, User, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { totalItems } = useCart()
  const [mounted, setMounted] = useState(false)

  // Fix hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/auth/login")
  }

  const navigateToCart = () => {
    router.push("/cart")
  }

  const isAdmin = session?.user?.role === "admin"

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">SimbiEat</span>
          </Link>
          <div className="flex items-center space-x-4">{/* Loading state */}</div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">SimbiEat</span>
        </Link>

        <div className="flex items-center space-x-4">
          {status === "authenticated" && session ? (
            <>
              {/* Only show Orders link for regular users */}
              {!isAdmin && (
                <Link href="/orders">
                  <Button variant="ghost">My Orders</Button>
                </Link>
              )}

              {/* Only show Cart for regular users */}
              {!isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={navigateToCart}
                  aria-label="View cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {session.user?.name || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline">
                <User className="h-5 w-5 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
